/* eslint-disable @typescript-eslint/naming-convention */

export interface Board {
  board: string;
  title: string;
  ws_board: 1 | 0;
  per_page: number;
  pages: number;
  max_filesize: number;
  max_webm_filesize: number;
  max_comment_chars: number;
  max_webm_duration: number;
  bump_limit: number;
  image_limit: number;
  cooldowns: {
    threads: number;
    replies: number;
    images: number;
  };
  meta_description: string;
  spoilers?: 1 | 0;
  custom_spoilers?: number;
  is_archived?: 1 | 0;
  board_flags?: Record<string, string>;
  country_flags?: 1 | 0;
  user_ids?: 1 | 0;
  oekaki?: 1 | 0;
  sjis_tags?: 1 | 0;
  code_tags?: 1 | 0;
  math_tags?: 1 | 0;
  text_only?: 1 | 0;
  forced_anon?: 1 | 0;
  webm_audio?: 1 | 0;
  require_subject?: 1 | 0;
  min_image_width?: number;
  min_image_height?: number;
}

export interface BoardsJSON {
  boards: Board[];
}

export interface IndexPost {
  /// always | The numeric post ID | `any positive integer` |
  no: number;
  /// always | For replies: this is the ID of the thread being replied to. For OP: this value is zero   | `0` or `Any positive integer`|
  resto: number;
  /// OP only, if thread is currently stickied | If the thread is being pinned to the top of the page| `1` or not set|
  sticky?: 1 | 0;
  /// OP only, if thread is currently closed | If the thread is closed to replies | `1` or not set|
  closed?: 1 | 0;
  /// always | MM/DD/YY(Day)HH:MM (:SS on some boards), EST/EDT timezone | `string` |
  now: string;
  /// always | UNIX timestamp the post was created |  `UNIX timestamp` |
  time: number;
  /// always | Name user posted with. Defaults to `Anonymous` | `any string` |
  name: string;
  /// if post has tripcode | The user's tripcode, in format: `!tripcode` or `!!securetripcode`| `any string` |
  trip?: string;
  /// if post has ID | The poster's ID | `any 8 characters` |
  id?: string;
  /// if post has capcode | The capcode identifier for a post | Not set, `mod`, `admin`, `admin_highlight`, `manager`, `developer`, `founder` |
  capcode?: string;
  /// if country flags are enabled | Poster's [ISO 3166-1 alpha-2 country code](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2) | `2 character string` or `XX` if unknown |
  country?: string;
  /// if country flags are enabled | Poster's country name | `Name of any country` |
  country_name?: string;
  /// OP only, if subject was included | OP Subject text | `any string` |
  sub?: string;
  /// if comment was included | Comment (HTML escaped) | `any HTML escaped string` |
  com?: string;
  /// always if post has attachment | Unix timestamp + microtime that an image was uploaded | `integer` |
  tim?: number;
  /// always if post has attachment | Filename as it appeared on the poster's device | `any string` |
  filename?: string;
  /// always if post has attachment | Filetype | `.jpg`, `.png`, `.gif`, `.pdf`, `.swf`, `.webm` |
  ext?: string;
  /// always if post has attachment | Size of uploaded file in bytes | `any integer` |
  fsize?: number;
  /// always if post has attachment | 24 character, packed base64 MD5 hash of file |  |
  md5?: string;
  /// always if post has attachment | Image width dimension | `any integer` |
  w?: number;
  /// always if post has attachment | Image height dimension | `any integer` |
  h?: number;
  /// always if post has attachment | Thumbnail image width dimension | `any integer` |
  tn_w?: number;
  /// always if post has attachment | Thumbnail image height dimension | `any integer` |
  tn_h?: number;
  /// if post had attachment and attachment is deleted | If the file was deleted from the post | `1` or not set |
  filedeleted?: 1 | 0;
  /// if post has attachment and attachment is spoilered | If the image was spoilered or not | `1` or not set |
  spoiler?: 1 | 0;
  /// if post has attachment and attachment is spoilered | The custom spoiler ID for a spoilered image | `1-10` or not set |
  custom_spoiler?: number;
  /// OP only | Number of replies minus the number of previewed replies | `any integer` |
  omitted_posts?: number;
  /// OP only | Number of image replies minus the number of previewed image replies | `any integer` |
  omitted_images?: number;
  /// OP only | Total number of replies to a thread | `any integer` |
  replies?: number;
  /// OP only | Total number of image replies to a thread | `any integer` |
  images?: number;
  /// OP only, only if bump limit has been reached | If a thread has reached bumplimit, it will no longer bump | `1` or not set |
  bumplimit?: 1 | 0;
  /// OP only, only if image limit has been reached | If an image has reached image limit, no more image replies can be made  | `1` or not set |
  imagelimit?: 1 | 0;
  /// OP only | The UNIX timestamp marking the last time the thread was modified (post added/modified/deleted, thread closed/sticky settings modified) | `UNIX Timestamp` |
  last_modified?: number;
  /// OP only, /f/ only | The category of `.swf` upload |`Game`, `Loop`, etc..|
  tag?: string;
  /// OP only | SEO URL slug for thread | `string` |
  semantic_url?: string;
  /// if poster put 'since4pass' in the options field | Year 4chan pass bought | `any 4 digit year`|
  since4pass?: number;
  /// OP only | Number of unique posters in a thread  | `any integer` |
  unique_ips?: number;
  /// any post that has a mobile-optimized image | Mobile optimized image exists for post | `1` or not set |
  m_img?: 1 | 0;
  /// Board | non-standard field | `string` |
  board?: string;
}

export interface IndexThread {
  posts: IndexPost[];
}

export interface IndexJSON {
  threads: IndexThread[];
}
