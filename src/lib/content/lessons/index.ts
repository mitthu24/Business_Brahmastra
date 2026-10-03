import type { Lesson } from "../types";
import { phase01Lessons } from "./phase-01-business";
import { phase02Lessons } from "./phase-02-startup";
import { phase03Lessons } from "./phase-03-customer";
import { phase04Lessons } from "./phase-04-product";
import { phase05Lessons } from "./phase-05-marketing";
import { phase06Lessons } from "./phase-06-sales";
import { phase07Lessons } from "./phase-07-operations";
import { phase08Lessons } from "./phase-08-finance";
import { phase09Lessons } from "./phase-09-legal";
import { phase10Lessons } from "./phase-10-management";
import { phase11Lessons } from "./phase-11-funding";
import { phase12Lessons } from "./phase-12-growth";
import { phase13Lessons } from "./phase-13-strategy";
import { phase14Lessons } from "./phase-14-analysis";
import { phase15Lessons } from "./phase-15-founder-project";

export const allLessons: Lesson[] = [
  ...phase01Lessons,
  ...phase02Lessons,
  ...phase03Lessons,
  ...phase04Lessons,
  ...phase05Lessons,
  ...phase06Lessons,
  ...phase07Lessons,
  ...phase08Lessons,
  ...phase09Lessons,
  ...phase10Lessons,
  ...phase11Lessons,
  ...phase12Lessons,
  ...phase13Lessons,
  ...phase14Lessons,
  ...phase15Lessons,
].sort((a, b) => a.day - b.day);

const lessonsByDay = new Map<number, Lesson>(allLessons.map((l) => [l.day, l]));

export function getLessonByDay(day: number): Lesson | undefined {
  return lessonsByDay.get(day);
}

export function getLessonBySlug(slug: string): Lesson | undefined {
  return allLessons.find((l) => l.slug === slug);
}

export const TOTAL_DAYS = 90;
