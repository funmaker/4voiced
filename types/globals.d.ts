
declare type ArrayElement<A> = A extends ReadonlyArray<infer T> ? T : never;

declare type Empty = Record<any, never>;

declare interface JustId { id: string }
declare interface JustBoard { board: string }

declare interface GenerateSpeechArgs {
  amplitude?: number;
  pitch?: number;
  speed?: number;
  wordgap?: number;
}

declare function generateSpeech(text: string, args?: SpeechArgs): Uint8Array;
