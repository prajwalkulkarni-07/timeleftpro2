import { getWeek, getDaysInMonth, getDaysInYear } from 'date-fns';

export const calculateTimeProgress = (date, preferences) => {
  const now = date || new Date();
  
  // Calculate day progress based on full 24-hour day
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentSecond = now.getSeconds();
  const totalSecondsInDay = 24 * 60 * 60;
  const secondsElapsed = (currentHour * 60 * 60) + (currentMinute * 60) + currentSecond;
  const currentDayProgress = (secondsElapsed / totalSecondsInDay) * 100;
  
  // Calculate week progress
  const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay(); // Make Sunday day 7
  const weekProgress = (dayOfWeek - 1 + (currentHour / 24)) / 7 * 100;
  
  // Calculate month progress
  const dayOfMonth = now.getDate();
  const daysInMonth = getDaysInMonth(now);
  const monthProgress = (dayOfMonth - 1 + (currentHour / 24)) / daysInMonth * 100;
  
  // Calculate year progress
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const daysInYear = getDaysInYear(now);
  const dayOfYear = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000)) + 1;
  const yearProgress = (dayOfYear - 1 + (currentHour / 24)) / daysInYear * 100;
  
  return {
    day: Math.min(currentDayProgress, 100),
    week: Math.min(weekProgress, 100),
    month: Math.min(monthProgress, 100),
    year: Math.min(yearProgress, 100)
  };
};