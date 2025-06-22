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
  "Andhra Pradesh": {
    "Visakhapatnam": {
      taluks: {
        "Visakhapatnam Urban": {
          villages: ["Visakhapatnam", "Gajuwaka", "Anakapalle", "Pendurthi", "Bheemunipatnam"],
          pincodes: ["530001", "530026", "531001", "531173", "531163"]
        },
        "Narsipatnam": {
          villages: ["Narsipatnam", "Komaravolu", "Ravikamatham", "Yellamanchili", "Chodavaram"],
          pincodes: ["531116", "531118", "531185", "531055", "531036"]
        }
      }
    },
    "Guntur": {
      taluks: {
        "Guntur": {
          villages: ["Guntur", "Mangalagiri", "Tadepalle", "Tenali", "Bapatla"],
          pincodes: ["522001", "522503", "522501", "522201", "522101"]
        }
      }
    }
  },
  "Arunachal Pradesh": {
    "Itanagar": {
      taluks: {
        "Itanagar": {
          villages: ["Itanagar", "Naharlagun", "Banderdewa", "Nirjuli", "Chimpu"],
          pincodes: ["791111", "791110", "791123", "791109", "791112"]
        }
      }
    },
    "Tawang": {
      taluks: {
        "Tawang": {
          villages: ["Tawang", "Mukto", "Lumla", "Thingbu", "Kitpi"],
          pincodes: ["790104", "790105", "790106", "790107", "790108"]
        }
      }
    }
  },
  "Assam": {
    "Kamrup": {
      taluks: {
        "Guwahati": {
          villages: ["Guwahati", "Dispur", "Beltola", "Jalukbari", "Khanapara"],
          pincodes: ["781001", "781006", "781028", "781013", "781022"]
        }
      }
    },
    "Dibrugarh": {
      taluks: {
        "Dibrugarh": {
          villages: ["Dibrugarh", "Duliajan", "Naharkatiya", "Moran", "Tingkhong"],
          pincodes: ["786001", "786602", "786610", "786612", "786612"]
        }
      }
    }
  },
  "Bihar": {
    "Patna": {
      taluks: {
        "Patna Sadar": {
          villages: ["Patna", "Danapur", "Phulwari", "Khagaul", "Sampatchak"],
          pincodes: ["800001", "801503", "801505", "801105", "800007"]
        }
      }
    },
    "Gaya": {
      taluks: {
        "Gaya": {
          villages: ["Gaya", "Bodh Gaya", "Sherghati", "Manpur", "Belaganj"],
          pincodes: ["823001", "824231", "824211", "824142", "824124"]
        }
      }
    }
  },
  "Chhattisgarh": {
    "Raipur": {
      taluks: {
        "Raipur": {
          villages: ["Raipur", "Bhilai", "Durg", "Rajnandgaon", "Bilaspur"],
          pincodes: ["492001", "490001", "491001", "491441", "495001"]
        }
      }
    }
  },
  "Goa": {
    "North Goa": {
      taluks: {
        "Panaji": {
          villages: ["Panaji", "Mapusa", "Bicholim", "Pernem", "Bardez"],
          pincodes: ["403001", "403507", "403504", "403512", "403509"]
        }
      }
    },
    "South Goa": {
      taluks: {
        "Margao": {
          villages: ["Margao", "Vasco da Gama", "Ponda", "Quepem", "Sanguem"],
          pincodes: ["403601", "403802", "403401", "403705", "403704"]
        }
      }
    }
  },
  "Gujarat": {
    "Ahmedabad": {
      taluks: {
        "Ahmedabad City": {
          villages: ["Ahmedabad", "Gandhinagar", "Kalol", "Sanand", "Dholka"],
          pincodes: ["380001", "382006", "382721", "382110", "387810"]
        }
      }
    },
    "Surat": {
      taluks: {
        "Surat": {
          villages: ["Surat", "Navsari", "Valsad", "Bharuch", "Ankleshwar"],
          pincodes: ["395001", "396445", "396001", "392001", "393001"]
        }
      }
    }
  },
  "Haryana": {
    "Gurugram": {
      taluks: {
        "Gurugram": {
          villages: ["Gurugram", "Faridabad", "Palwal", "Nuh", "Sohna"],
          pincodes: ["122001", "121001", "121102", "122107", "122103"]
        }
      }
    },
    "Ambala": {
      taluks: {
        "Ambala": {
          villages: ["Ambala", "Kurukshetra", "Karnal", "Panipat", "Sonipat"],
          pincodes: ["134001", "136118", "132001", "132103", "131001"]
        }
      }
    }
  },
  "Himachal Pradesh": {
    "Shimla": {
      taluks: {
        "Shimla": {
          villages: ["Shimla", "Solan", "Kasauli", "Kandaghat", "Dharampur"],
          pincodes: ["171001", "173212", "173204", "173215", "173001"]
        }
      }
    },
    "Kangra": {
      taluks: {
        "Dharamshala": {
          villages: ["Dharamshala", "McLeod Ganj", "Kangra", "Palampur", "Baijnath"],
          pincodes: ["176215", "176219", "176001", "176061", "176125"]
        }
      }
    }
  },
  "Jharkhand": {
    "Ranchi": {
      taluks: {
        "Ranchi": {
          villages: ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar"],
          pincodes: ["834001", "831001", "826001", "827001", "814112"]
        }
      }
    }
  },
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
        }
      }
    }
  },
  "Kerala": {
    "Thiruvananthapuram": {
      taluks: {
        "Thiruvananthapuram": {
          villages: ["Thiruvananthapuram", "Neyyattinkara", "Varkala", "Attingal", "Nedumangad"],
          pincodes: ["695001", "695121", "695141", "695101", "695541"]
        }
      }
    },
    "Kochi": {
      taluks: {
        "Kochi": {
          villages: ["Kochi", "Ernakulam", "Aluva", "Perumbavoor", "Muvattupuzha"],
          pincodes: ["682001", "682011", "683101", "683542", "686661"]
        }
      }
    }
  },
  "Madhya Pradesh": {
    "Bhopal": {
      taluks: {
        "Bhopal": {
          villages: ["Bhopal", "Sehore", "Raisen", "Vidisha", "Berasia"],
          pincodes: ["462001", "466001", "464551", "464001", "462038"]
        }
      }
    },
    "Indore": {
      taluks: {
        "Indore": {
          villages: ["Indore", "Ujjain", "Dewas", "Dhar", "Khargone"],
          pincodes: ["452001", "456001", "455001", "454001", "451001"]
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
    },
    "Nashik": {
      taluks: {
        "Nashik": {
          villages: ["Nashik", "Malegaon", "Sinnar", "Niphad", "Dindori"],
          pincodes: ["422001", "423203", "422103", "422209", "422202"]
        }
      }
    }
  },
  "Manipur": {
    "Imphal West": {
      taluks: {
        "Imphal": {
          villages: ["Imphal", "Lamphel", "Thangmeiband", "Uripok", "Sagolband"],
          pincodes: ["795001", "795004", "795001", "795001", "795001"]
        }
      }
    }
  },
  "Meghalaya": {
    "East Khasi Hills": {
      taluks: {
        "Shillong": {
          villages: ["Shillong", "Laitumkhrah", "Police Bazar", "Jaiaw", "Mawlai"],
          pincodes: ["793001", "793003", "793001", "793002", "793008"]
        }
      }
    }
  },
  "Mizoram": {
    "Aizawl": {
      taluks: {
        "Aizawl": {
          villages: ["Aizawl", "Durtlang", "Ramhlun", "Bawngkawn", "Chaltlang"],
          pincodes: ["796001", "796025", "796012", "796014", "796012"]
        }
      }
    }
  },
  "Nagaland": {
    "Kohima": {
      taluks: {
        "Kohima": {
          villages: ["Kohima", "Dimapur", "Mokokchung", "Tuensang", "Wokha"],
          pincodes: ["797001", "797112", "798601", "798612", "798601"]
        }
      }
    }
  },
  "Odisha": {
    "Khurda": {
      taluks: {
        "Bhubaneswar": {
          villages: ["Bhubaneswar", "Cuttack", "Puri", "Berhampur", "Rourkela"],
          pincodes: ["751001", "753001", "752001", "760001", "769001"]
        }
      }
    }
  },
  "Punjab": {
    "Amritsar": {
      taluks: {
        "Amritsar": {
          villages: ["Amritsar", "Jalandhar", "Ludhiana", "Patiala", "Bathinda"],
          pincodes: ["143001", "144001", "141001", "147001", "151001"]
        }
      }
    }
  },
  "Rajasthan": {
    "Jaipur": {
      taluks: {
        "Jaipur": {
          villages: ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Bikaner"],
          pincodes: ["302001", "342001", "313001", "324001", "334001"]
        }
      }
    }
  },
  "Sikkim": {
    "East Sikkim": {
      taluks: {
        "Gangtok": {
          villages: ["Gangtok", "Rangpo", "Singtam", "Ranipool", "Tadong"],
          pincodes: ["737101", "737132", "737134", "737135", "737102"]
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
        }
      }
    }
  },
  "Telangana": {
    "Hyderabad": {
      taluks: {
        "Hyderabad": {
          villages: ["Hyderabad", "Secunderabad", "Cyberabad", "Gachibowli", "Madhapur"],
          pincodes: ["500001", "500003", "500032", "500032", "500081"]
        }
      }
    }
  },
  "Tripura": {
    "West Tripura": {
      taluks: {
        "Agartala": {
          villages: ["Agartala", "Udaipur", "Dharmanagar", "Kailashahar", "Belonia"],
          pincodes: ["799001", "799120", "799250", "799277", "799155"]
        }
      }
    }
  },
  "Uttar Pradesh": {
    "Lucknow": {
      taluks: {
        "Lucknow": {
          villages: ["Lucknow", "Kanpur", "Agra", "Varanasi", "Meerut"],
          pincodes: ["226001", "208001", "282001", "221001", "250001"]
        }
      }
    }
  },
  "Uttarakhand": {
    "Dehradun": {
      taluks: {
        "Dehradun": {
          villages: ["Dehradun", "Haridwar", "Rishikesh", "Mussoorie", "Roorkee"],
          pincodes: ["248001", "249401", "249201", "248179", "247667"]
        }
      }
    }
  },
  "West Bengal": {
    "Kolkata": {
      taluks: {
        "Kolkata": {
          villages: ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri"],
          pincodes: ["700001", "711101", "713201", "713301", "734001"]
        }
      }
    }
  },
  // Union Territories
  "Andaman and Nicobar Islands": {
    "South Andaman": {
      taluks: {
        "Port Blair": {
          villages: ["Port Blair", "Havelock", "Neil Island", "Ross Island", "Viper Island"],
          pincodes: ["744101", "744211", "744104", "744101", "744101"]
        }
      }
    }
  },
  "Chandigarh": {
    "Chandigarh": {
      taluks: {
        "Chandigarh": {
          villages: ["Sector 17", "Sector 22", "Sector 35", "Sector 43", "Mani Majra"],
          pincodes: ["160017", "160022", "160035", "160043", "160101"]
        }
      }
    }
  },
  "Dadra and Nagar Haveli and Daman and Diu": {
    "Daman": {
      taluks: {
        "Daman": {
          villages: ["Daman", "Diu", "Silvassa", "Naroli", "Khanvel"],
          pincodes: ["396210", "362520", "396230", "396235", "396240"]
        }
      }
    }
  },
  "Delhi": {
    "Central Delhi": {
      taluks: {
        "Central Delhi": {
          villages: ["Connaught Place", "Karol Bagh", "Paharganj", "Rajendra Place", "Darya Ganj"],
          pincodes: ["110001", "110005", "110055", "110060", "110002"]
        }
      }
    },
    "South Delhi": {
      taluks: {
        "South Delhi": {
          villages: ["Hauz Khas", "Lajpat Nagar", "Defence Colony", "Greater Kailash", "Saket"],
          pincodes: ["110016", "110024", "110024", "110048", "110017"]
        }
      }
    }
  },
  "Jammu and Kashmir": {
    "Srinagar": {
      taluks: {
        "Srinagar": {
          villages: ["Srinagar", "Dal Lake", "Gulmarg", "Pahalgam", "Sonamarg"],
          pincodes: ["190001", "190001", "193403", "192126", "191203"]
        }
      }
    },
    "Jammu": {
      taluks: {
        "Jammu": {
          villages: ["Jammu", "Kathua", "Udhampur", "Samba", "Reasi"],
          pincodes: ["180001", "184101", "182101", "184121", "182311"]
        }
      }
    }
  },
  "Ladakh": {
    "Leh": {
      taluks: {
        "Leh": {
          villages: ["Leh", "Nubra Valley", "Pangong", "Zanskar", "Drass"],
          pincodes: ["194101", "194401", "194101", "194401", "194301"]
        }
      }
    }
  },
  "Lakshadweep": {
    "Lakshadweep": {
      taluks: {
        "Kavaratti": {
          villages: ["Kavaratti", "Agatti", "Minicoy", "Bangaram", "Kalpeni"],
          pincodes: ["682555", "682551", "682559", "682553", "682557"]
        }
      }
    }
  },
  "Puducherry": {
    "Puducherry": {
      taluks: {
        "Puducherry": {
          villages: ["Puducherry", "Karaikal", "Mahe", "Yanam", "Villianur"],
          pincodes: ["605001", "609601", "673310", "533464", "605110"]
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
