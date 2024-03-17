import { Board, BoardsJSON, IndexJSON, IndexPost } from "../../types/4chan";
import * as dispatchController from "./dispatch";
import * as chanController from "./4chan";


const INDEX_FETCH_SLEEP_MAX = 20 * 60 * 1000;
const POST_HISTORY_LENGTH = 100;
const POST_TARGET_POSTS_REFRESH = 5;

export const boards = new Map<string, BoardInstance>();

export async function refreshBoards() {
  const response = await chanController.request<BoardsJSON>("boards.json");
  if(!response) return;
  
  for(const info of response.boards) {
    const instance = boards.get(info.board);
    if(instance) instance.updateInfo(info);
    else boards.set(info.board, new BoardInstance(info));
  }
}

refreshBoards().catch((err) => console.error("Failed to fetch boards.", err));

let terminated = false;
let isFetching = false;
let sleepTimeout: NodeJS.Timeout | null = null;
export async function startFetching() {
  if(isFetching) return;
  
  try {
    isFetching = true;
    
    if(sleepTimeout !== null) {
      console.log("Sleep interrupted.");
      clearTimeout(sleepTimeout);
      sleepTimeout = null;
    }
    
    while(!terminated) {
      let nextFetchEstimation: number | null = null;
      let nextBoard: BoardInstance | null = null;
      for(const board of boards.values()) {
        const estimation = board.nextFetchEstimation();
        
        if(estimation !== null && (nextFetchEstimation === null || nextFetchEstimation > estimation)) {
          nextFetchEstimation = estimation;
          nextBoard = board;
        }
      }
      
      if(nextBoard === null || nextFetchEstimation === null) {
        console.log("Nothing to fetch, fetching stopped.");
        return;
      } else if(nextFetchEstimation > Date.now()) {
        const sleepDuration = nextFetchEstimation - Date.now();
        console.log(`Nothing to fetch at the moment, sleeping for ${(sleepDuration / 1000).toFixed(2)}s`);
        sleepTimeout = setTimeout(() => {
          sleepTimeout = null;
          startFetching();
        }, sleepDuration + 100);
        return;
      }
      
      console.log(`Fetching board /${nextBoard.info.board}/...`);
      try {
        nextBoard.fetching = true;
        dispatchController.broadcastStatus();
        const index = await chanController.request<IndexJSON>(`/${nextBoard.info.board}/1.json`);
        nextBoard.updateIndex(index);
      } finally {
        nextBoard.fetching = false;
        dispatchController.broadcastStatus();
      }
    }
  } catch(err) {
    console.error("Error while fetching posts: ", err);
  } finally {
    isFetching = false;
  }
}

class BoardInstance {
  private nextFetchHint: number | null = null;
  private lastPosts: IndexPost[] = [];
  fetching = false;
  lastPostNo: number | null = null;
  get name() { return this.info.board; }
  
  constructor(public info: Board) {}
  
  updateInfo(info: Board) {
    this.info = info;
  }
  
  updateIndex(index: IndexJSON | null) {
    const posts: IndexPost[] = [];
    const firstFetch = this.lastPostNo === null;
    
    if(index) {
      for(const thread of index.threads) {
        for(const post of thread.posts) {
          if((this.lastPostNo !== null && post.no > this.lastPostNo)
          || (firstFetch && (post.time * 1000) > Date.now() - INDEX_FETCH_SLEEP_MAX)) {
            post.board = this.name;
            posts.push(post);
          }
        }
      }
    }
    
    posts.sort((a, b) => a.no - b.no);
    
    if(this.lastPostNo !== null) {
      let missed = 0;
      for(const post of posts) {
        if(post.no <= this.lastPostNo) continue;
        else if(this.lastPostNo < post.no - 1) missed += post.no - this.lastPostNo - 1;
        
        this.lastPostNo = post.no;
      }
      
      if(missed > 0) console.warn(`Missed ${missed} posts on board /${this.name}/`);
    } else if(posts.length > 0) {
      this.lastPostNo = posts[posts.length - 1].no;
    }
    
    console.log(`Got ${posts.length} new posts on board /${this.name}/.`);
    this.lastPosts.push(...posts);
    this.lastPosts.sort((a, b) => a.no - b.no);
    if(this.lastPosts.length > POST_HISTORY_LENGTH) this.lastPosts.splice(0, this.lastPosts.length - POST_HISTORY_LENGTH);
    
    if(this.lastPosts.length > 0) {
      const oldest = this.lastPosts[0];
      const newest = this.lastPosts[this.lastPosts.length - 1];
      const posts = newest.no - oldest.no + 1;
      const averageTime = (Date.now() - (oldest.time * 1000)) / posts;
      const nextPostsIn = POST_TARGET_POSTS_REFRESH * averageTime;
      
      this.nextFetchHint = Date.now() + Math.min(nextPostsIn, INDEX_FETCH_SLEEP_MAX);
    } else {
      this.nextFetchHint = Date.now() + INDEX_FETCH_SLEEP_MAX;
    }
    
    if(posts.length > 0) {
      const now = Date.now();
      const until = this.nextFetchHint;
      
      let since;
      if(firstFetch) since = now - (until - now);
      else since = posts[0].time * 1000;
      
      for(const post of posts) {
        if(post.time * 1000 < since) continue;
        
        dispatchController.dispatchPost(post, this.name, (post.time * 1000 - since) / (now - since) * (until - now));
      }
    }
  }
  
  nextFetchEstimation(): number | null {
    if(dispatchController.listenerCount(this.name) === 0) return null;
    else if(this.nextFetchHint === null) return 0;
    else return this.nextFetchHint;
  }
}

if(module.hot) {
  module.hot.dispose(() => {
    if(sleepTimeout) {
      clearTimeout(sleepTimeout);
      sleepTimeout = null;
    }
    
    terminated = true;
  });
}
