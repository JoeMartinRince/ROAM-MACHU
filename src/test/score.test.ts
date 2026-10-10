import { describe, it, expect, beforeEach } from "vitest";
import { _reset, getState, placeScore, rankedPlaces, votePlace, votePost } from "@/lib/store";

describe("voting updates place score", () => {
  beforeEach(() => _reset());
  it("upvoting a post raises its place score", () => {
    const before = placeScore(getState(), "alleppey");
    votePost("p1", 1);
    expect(placeScore(getState(), "alleppey")).toBe(before + 0.5);
  });
  it("votes reorder the trending list", () => {
    expect(rankedPlaces(getState())[0].id).toBe("alleppey");
    votePost("p5", 1);
    votePlace("ladakh", 1);
    expect(rankedPlaces(getState())[0].id).toBe("ladakh");
  });
});
