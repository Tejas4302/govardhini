
// Comprehensive location data for Indian states with districts, taluks, villages and pincodes

interface TalukData {
  villages: string[];
  pincodes: string[];
}

interface DistrictData {
  taluks: { [talukName: string]: TalukData };
}

interface StateData {
  [districtName: string]: DistrictData;
}

interface ComprehensiveLocationData {
  [stateName: string]: StateData;
}

export const comprehensiveLocationData: ComprehensiveLocationData = {
  "Karnataka": {
    "Bengaluru Urban": {
      taluks: {
        "Bengaluru North": {
          villages: ["Yelahanka", "Jakkur", "Kogilu", "Attur", "Sonnenahalli", "Bagalur", "Chokkanahalli"],
          pincodes: ["560063", "560064", "560065", "560077", "560090", "560091", "560092"]
        },
        "Bengaluru South": {
          villages: ["Begur", "Hongasandra", "Hulimavu", "Gottigere", "Konanakunte", "Anjanapura"],
          pincodes: ["560068", "560076", "560099", "560100", "560062", "560108"]
        },
        "Anekal": {
          villages: ["Anekal", "Chandapura", "Attibele", "Jigani", "Bommasandra", "Huskur", "Sarjapur"],
          pincodes: ["560099", "560061", "562107", "560105", "560099", "560099", "562125"]
        }
      }
    },
    "Mysuru": {
      taluks: {
        "Mysuru": {
          villages: ["Mysuru City", "Bogadi", "Vijayanagar", "Jayapura", "Srirampura", "Kadakola"],
          pincodes: ["570001", "570002", "570008", "570009", "570023", "570026"]
        },
        "Hunsur": {
          villages: ["Hunsur", "Piriyapatna", "Antrasante", "Sosale", "Kyathanahalli", "Bilikere"],
          pincodes: ["571105", "571107", "571114", "571121", "571124", "571126"]
        },
        "Nanjangud": {
          villages: ["Nanjangud", "Hullahalli", "Mellahalli", "Doddakanya", "T. Begur", "Halagur"],
          pincodes: ["571301", "571302", "571311", "571312", "571313", "571316"]
        }
      }
    },
    "Hassan": {
      taluks: {
        "Hassan": {
          villages: ["Hassan City", "Gorur", "Kenchanakuppe", "Hemmige", "Narasimharajapura", "Chikkamagadi"],
          pincodes: ["573201", "573211", "573212", "573213", "573214", "573219"]
        },
        "Belur": {
          villages: ["Belur", "Halebidu", "Javagal", "Yeslur", "Konanur", "Arakalgud"],
          pincodes: ["573115", "573121", "573123", "573124", "573126", "573103"]
        },
        "Sakleshpur": {
          villages: ["Sakleshpur", "Hettur", "Manjarabad", "Yeslur", "Kadumane", "Bettadahalli"],
          pincodes: ["573134", "573135", "573137", "573139", "573141", "573142"]
        }
      }
    }
  },
  "Tamil Nadu": {
    "Chennai": {
      taluks: {
        "Chennai North": {
          villages: ["Purasaiwakkam", "Kilpauk", "Egmore", "Washermanpet", "Royapuram", "Thiruvottriyur"],
          pincodes: ["600007", "600010", "600008", "600021", "600013", "600019"]
        },
        "Chennai South": {
          villages: ["Adyar", "Mylapore", "Guindy", "Velachery", "Sholinganallur", "Pallikaranai"],
          pincodes: ["600020", "600004", "600032", "600042", "600119", "600100"]
        }
      }
    },
    "Coimbatore": {
      taluks: {
        "Coimbatore North": {
          villages: ["Ganapathy", "Saravanampatti", "Kalapatti", "Thudiyalur", "Madukkarai", "Narasimhanaickenpalayam"],
          pincodes: ["641006", "641035", "641014", "641034", "641105", "641031"]
        },
        "Coimbatore South": {
          villages: ["Peelamedu", "Saibaba Colony", "Vadavalli", "Podanur", "Sulur", "Irugur"],
          pincodes: ["641004", "641011", "641041", "641023", "641402", "641103"]
        }
      }
    }
  },
  "Maharashtra": {
    "Mumbai City": {
      taluks: {
        "Mumbai City": {
          villages: ["Colaba", "Fort", "Marine Lines", "Churchgate", "Nariman Point", "Cuffe Parade"],
          pincodes: ["400001", "400002", "400020", "400021", "400005", "400039"]
        }
      }
    },
    "Pune": {
      taluks: {
        "Pune City": {
          villages: ["Shivajinagar", "Kothrud", "Karve Nagar", "Warje", "Baner", "Aundh"],
          pincodes: ["411005", "411029", "411052", "411058", "411045", "411007"]
        },
        "Haveli": {
          villages: ["Pirangut", "Mulshi", "Lavasa", "Temghar", "Tathawade", "Ravet"],
          pincodes: ["412115", "412108", "412112", "412109", "411062", "412101"]
        }
      }
    }
  }
};

// Flatten data for easy searching
export const getAllStates = (): string[] => {
  return Object.keys(comprehensiveLocationData);
};

export const getDistrictsByState = (state: string): string[] => {
  const stateData = comprehensiveLocationData[state];
  return stateData ? Object.keys(stateData) : [];
};

export const getTaluksByDistrict = (state: string, district: string): string[] => {
  const stateData = comprehensiveLocationData[state];
  if (!stateData) return [];
  
  const districtData = stateData[district];
  if (!districtData) return [];
  
  return Object.keys(districtData.taluks);
};

export const getVillagesByTaluk = (state: string, district: string, taluk: string): string[] => {
  const stateData = comprehensiveLocationData[state];
  if (!stateData) return [];
  
  const districtData = stateData[district];
  if (!districtData) return [];
  
  const talukData = districtData.taluks[taluk];
  if (!talukData) return [];
  
  return talukData.villages;
};

export const getPincodesByLocation = (state: string, district: string, taluk: string): string[] => {
  const stateData = comprehensiveLocationData[state];
  if (!stateData) return [];
  
  const districtData = stateData[district];
  if (!districtData) return [];
  
  const talukData = districtData.taluks[taluk];
  if (!talukData) return [];
  
  return talukData.pincodes;
};

export const getPincodeByVillage = (state: string, district: string, taluk: string, village: string): string | null => {
  const stateData = comprehensiveLocationData[state];
  if (!stateData) return null;
  
  const districtData = stateData[district];
  if (!districtData) return null;
  
  const talukData = districtData.taluks[taluk];
  if (!talukData) return null;
  
  const villageIndex = talukData.villages.indexOf(village);
  if (villageIndex !== -1 && talukData.pincodes[villageIndex]) {
    return talukData.pincodes[villageIndex];
  }
  
  return null;
};

// Search functions for autocomplete
export const searchVillages = (query: string, state: string, district: string, taluk: string): string[] => {
  const villages = getVillagesByTaluk(state, district, taluk);
  if (!query) return villages;
  
  return villages.filter(village => 
    village.toLowerCase().includes(query.toLowerCase())
  );
};

export const searchTaluks = (query: string, state: string, district: string): string[] => {
  const taluks = getTaluksByDistrict(state, district);
  if (!query) return taluks;
  
  return taluks.filter(taluk => 
    taluk.toLowerCase().includes(query.toLowerCase())
  );
};

export const searchPincodes = (query: string, state: string, district: string, taluk: string): string[] => {
  const pincodes = getPincodesByLocation(state, district, taluk);
  if (!query) return pincodes;
  
  return pincodes.filter(pincode => 
    pincode.includes(query)
  );
};
