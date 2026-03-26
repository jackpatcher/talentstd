// routes.js - Centralized route definitions for TalentStd

export const ROUTES = {
  HOME: '/home',
  ADMIN: '/admin',
  ADMIN_LOGIN: '/admin/login',
  ADMIN_ADMISSIONS: '/admin/admissions',
  ADMIN_JUDGES: '/admin/judges',
  ADMIN_STUDENTS: '/admin/students',
  ADMIN_CRITERIA: '/admin/criteria',
  ADMIN_REPORT: '/admin/report',
  ADMIN_SETTINGS: '/admin/settings',
  JUDGE: '/judge',
  JUDGE_LOGIN: '/judge/login',
  JUDGE_STUDENTS: '/judge/students',
  JUDGE_SCORE: '/judge/score',
};

// Example usage:
// import { ROUTES } from '../routes';
// navigation.navigate(ROUTES.ADMIN_LOGIN);
// <Link to={ROUTES.HOME}>Home</Link>
