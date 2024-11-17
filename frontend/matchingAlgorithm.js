import geolib from "geolib";
import getDistance from "geolib";

/**
 * Calculate the compatibility score between two users based on their profile preferences.
 * @param {Object} user1 - The logged-in user's preferences and location.
 * @param {Object} user2 - A potential match's preferences and location.
 * @returns {Number} - A compatibility score.
 */
export const calculateMatchScore = (user1, user2) => {
  let score = 0;

  const weights = {
    livingSpaceType: 10,
    roomType: 10,
    smoking: 15,
    cleaningFrequency: 10,
    sleepSchedule: 10,
    guestFrequency: 10,
    noiseTolerance: 10,
    socialLevel: 10,
    workSchedule: 15,
    budget: 20,
  };

  // Calculate score based on profile compatibility
  Object.keys(weights).forEach((field) => {
    if (user1[field] && user2[field] && user1[field] === user2[field]) {
      score += weights[field];
    }
  });


  return score;
};