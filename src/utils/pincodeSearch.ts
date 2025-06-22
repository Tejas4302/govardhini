
import { comprehensiveLocationData } from './comprehensiveLocationData';

export const searchPincodeByLocation = (state: string, district: string, taluk: string, village: string): string => {
  // If no state is selected, return empty
  if (!state) return '';
  
  const stateData = comprehensiveLocationData[state];
  if (!stateData) return '';
  
  // If we have exact matches, use the existing function
  if (district && taluk && village) {
    const districtData = stateData[district];
    if (districtData) {
      const talukData = districtData.taluks[taluk];
      if (talukData) {
        const villageIndex = talukData.villages.indexOf(village);
        if (villageIndex !== -1 && talukData.pincodes[villageIndex]) {
          return talukData.pincodes[villageIndex];
        }
      }
    }
  }
  
  // Fuzzy search for partial matches
  return fuzzySearchPincode(state, district, taluk, village);
};

const fuzzySearchPincode = (state: string, district: string, taluk: string, village: string): string => {
  const stateData = comprehensiveLocationData[state];
  if (!stateData) return '';
  
  const searchTerms = {
    district: district.toLowerCase().trim(),
    taluk: taluk.toLowerCase().trim(),
    village: village.toLowerCase().trim()
  };
  
  let bestMatch = '';
  let matchScore = 0;
  
  // Search through all districts in the state
  for (const [districtName, districtData] of Object.entries(stateData)) {
    let currentScore = 0;
    
    // Score district match
    if (searchTerms.district && districtName.toLowerCase().includes(searchTerms.district)) {
      currentScore += 3;
    }
    
    // Search through taluks in this district
    for (const [talukName, talukData] of Object.entries(districtData.taluks)) {
      let talukScore = currentScore;
      
      // Score taluk match
      if (searchTerms.taluk && talukName.toLowerCase().includes(searchTerms.taluk)) {
        talukScore += 2;
      }
      
      // Search through villages in this taluk
      for (let i = 0; i < talukData.villages.length; i++) {
        const villageName = talukData.villages[i];
        let villageScore = talukScore;
        
        // Score village match
        if (searchTerms.village && villageName.toLowerCase().includes(searchTerms.village)) {
          villageScore += 1;
        }
        
        // If this is the best match so far, save the pincode
        if (villageScore > matchScore && talukData.pincodes[i]) {
          matchScore = villageScore;
          bestMatch = talukData.pincodes[i];
        }
      }
    }
  }
  
  return bestMatch;
};

// Debounce function to limit API calls
export const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
