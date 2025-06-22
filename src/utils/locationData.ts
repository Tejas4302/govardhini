
export const indianStates = [
  "Andhra Pradesh",
  "Arunachal Pradesh", 
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal"
];

export const stateDistrictData: Record<string, string[]> = {
  "Karnataka": [
    "Bagalkot", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban",
    "Bidar", "Chamarajanagar", "Chikballapur", "Chikkamagaluru", "Chitradurga",
    "Dakshina Kannada", "Davangere", "Dharwad", "Gadag", "Hassan",
    "Haveri", "Kalaburagi", "Kodagu", "Kolar", "Koppal",
    "Mandya", "Mysuru", "Raichur", "Ramanagara", "Shivamogga",
    "Tumakuru", "Udupi", "Uttara Kannada", "Vijayapura", "Yadgir"
  ],
  "Tamil Nadu": [
    "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore",
    "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kanchipuram",
    "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai",
    "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai",
    "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi",
    "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli",
    "Tirupattur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur",
    "Vellore", "Viluppuram", "Virudhunagar"
  ],
  "Maharashtra": [
    "Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed",
    "Bhandara", "Buldhana", "Chandrapur", "Dhule", "Gadchiroli",
    "Gondia", "Hingoli", "Jalgaon", "Jalna", "Kolhapur",
    "Latur", "Mumbai City", "Mumbai Suburban", "Nagpur", "Nanded",
    "Nandurbar", "Nashik", "Osmanabad", "Palghar", "Parbhani",
    "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara",
    "Sindhudurg", "Solapur", "Thane", "Wardha", "Washim", "Yavatmal"
  ]
  // Add more states and districts as needed
};

export const getDistrictsByState = (state: string): string[] => {
  return stateDistrictData[state] || [];
};

export const getTaluksByDistrict = (district: string): string[] => {
  // This is a simplified example. In a real app, you'd have a comprehensive database
  const talukData: Record<string, string[]> = {
    "Bengaluru Urban": ["Bengaluru North", "Bengaluru South", "Anekal"],
    "Mysuru": ["Mysuru", "Hunsur", "Krishnarajanagara", "Nanjangud"],
    "Hassan": ["Hassan", "Alur", "Arkalgud", "Belur", "Channarayapatna", "Holenarasipur", "Sakleshpur"],
    // Add more districts and their taluks
  };
  
  return talukData[district] || [];
};

export const commonTownsAndVillages = [
  "Bangalore", "Mysore", "Hassan", "Mandya", "Tumkur", "Kolar",
  "Chikmagalur", "Shimoga", "Davangere", "Bellary", "Chitradurga",
  "Dharwad", "Hubli", "Belgaum", "Bijapur", "Gulbarga", "Raichur"
  // Add more common towns and villages
];

export const commonPincodes = [
  "560001", "560002", "560003", "560004", "560005", "560010", "560020",
  "570001", "570002", "570003", "570005", "570010", "570020",
  "573101", "573102", "573103", "573201", "573211", "573212"
  // Add more common pincodes
];
