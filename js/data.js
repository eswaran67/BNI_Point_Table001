/**
 * Tournament Line-up & Points Data
 * 5 Iconic Teams: Baasha, Padayappa, Sivaji, Petta, Jailer
 */

const TOURNAMENT_SETTINGS = {
  title: "BNI TOURNAMENT • FIVE TEAMS MEMBER LINE-UP",
  subtitle: "CHAMPIONSHIP POINTS TABLE & TEAM ROSTER",
  winPoints: 1, // Updated: Win gives 1 point as requested!
  tiePoints: 0.5,
  lossPoints: 0
};

const DEFAULT_TEAMS = [
  {
    id: "baasha",
    name: "BAASHA",
    tamilName: "பாட்ஷா",
    tagline: "Manick Baasha - Naan oru thadava sonna...",
    badgeClass: "badge-baasha",
    accentColor: "#f59e0b",
    secondaryColor: "#ef4444",
    glowColor: "rgba(245, 158, 11, 0.4)",
    captain: "Raj venkatesh",
    viceCaptain: "Suhaina",
    members: [
      "Victor",
      "Lakshmanan",
      "Karthick kumar",
      "Daniel",
      "A.suresh babu",
      "Ashok Kumar",
      "Sridhar"
    ],
    players: [
      { name: "Raj venkatesh", role: "Captain", points: 0 },
      { name: "Suhaina", role: "Vice Captain", points: 0 },
      { name: "Victor", role: "Member", points: 0 },
      { name: "Lakshmanan", role: "Member", points: 0 },
      { name: "Karthick kumar", role: "Member", points: 0 },
      { name: "Daniel", role: "Member", points: 0 },
      { name: "A.suresh babu", role: "Member", points: 0 },
      { name: "Ashok Kumar", role: "Member", points: 0 },
      { name: "Sridhar", role: "Member", points: 0 }
    ],
    stats: {
      played: 0,
      won: 0,
      lost: 0,
      tied: 0,
      points: 0,
      nrr: "0.00",
      bonus: 0,
      form: []
    }
  },
  {
    id: "padayappa",
    name: "PADAYAPPA",
    tamilName: "படையப்பா",
    tagline: "En vazhi thani vazhi!",
    badgeClass: "badge-padayappa",
    accentColor: "#fbbf24",
    secondaryColor: "#b45309",
    glowColor: "rgba(251, 191, 36, 0.4)",
    captain: "Rahul",
    viceCaptain: "Vijayakumar (Vijay Media)",
    members: [
      "Priyatharshini",
      "SENBAGARAJA",
      "Premkumar",
      "Manikandan G",
      "Gowtham K G",
      "Vignesh C",
      "Bethuraj"
    ],
    players: [
      { name: "Rahul", role: "Captain", points: 0 },
      { name: "Vijayakumar (Vijay Media)", role: "Vice Captain", points: 0 },
      { name: "Priyatharshini", role: "Member", points: 0 },
      { name: "SENBAGARAJA", role: "Member", points: 0 },
      { name: "Premkumar", role: "Member", points: 0 },
      { name: "Manikandan G", role: "Member", points: 0 },
      { name: "Gowtham K G", role: "Member", points: 0 },
      { name: "Vignesh C", role: "Member", points: 0 },
      { name: "Bethuraj", role: "Member", points: 0 }
    ],
    stats: {
      played: 0,
      won: 0,
      lost: 0,
      tied: 0,
      points: 0,
      nrr: "0.00",
      bonus: 0,
      form: []
    }
  },
  {
    id: "sivaji",
    name: "SIVAJI",
    subtitleBadge: "The boss",
    tamilName: "சிவாஜி The boss",
    tagline: "Kanna, panni dhan koottama varum, Singam single-a dhaan varum!",
    badgeClass: "badge-sivaji",
    accentColor: "#38bdf8",
    secondaryColor: "#0284c7",
    glowColor: "rgba(56, 189, 248, 0.45)",
    captain: "Arjun P",
    viceCaptain: "Ranjitha Marry",
    members: [
      "Muthuraj",
      "Soundarapandi",
      "Jerrin Thomas",
      "Harish Raj",
      "Dilip Kumar",
      "Senthil Kumar",
      "Nevendra Pandian"
    ],
    players: [
      { name: "Arjun P", role: "Captain", points: 0 },
      { name: "Ranjitha Marry", role: "Vice Captain", points: 0 },
      { name: "Muthuraj", role: "Member", points: 0 },
      { name: "Soundarapandi", role: "Member", points: 0 },
      { name: "Jerrin Thomas", role: "Member", points: 0 },
      { name: "Harish Raj", role: "Member", points: 0 },
      { name: "Dilip Kumar", role: "Member", points: 0 },
      { name: "Senthil Kumar", role: "Member", points: 0 },
      { name: "Nevendra Pandian", role: "Member", points: 0 }
    ],
    stats: {
      played: 0,
      won: 0,
      lost: 0,
      tied: 0,
      points: 0,
      nrr: "0.00",
      bonus: 0,
      form: []
    }
  },
  {
    id: "petta",
    name: "PETTA",
    tamilName: "பேட்ட",
    tagline: "Kaali... Petta Paraak!",
    badgeClass: "badge-petta",
    accentColor: "#22d3ee",
    secondaryColor: "#0891b2",
    glowColor: "rgba(34, 211, 238, 0.45)",
    captain: "Vijayakumar (Vijay Cater)",
    viceCaptain: "Mariappan",
    members: [
      "Rajendran P",
      "Mari Selvam",
      "DINESH KUMAR",
      "Usha Ramesh",
      "Prasanna Rajan",
      "Mukesh Kumar",
      "Manikandan J"
    ],
    players: [
      { name: "Vijayakumar (Vijay Cater)", role: "Captain", points: 0 },
      { name: "Mariappan", role: "Vice Captain", points: 0 },
      { name: "Rajendran P", role: "Member", points: 0 },
      { name: "Mari Selvam", role: "Member", points: 0 },
      { name: "DINESH KUMAR", role: "Member", points: 0 },
      { name: "Usha Ramesh", role: "Member", points: 0 },
      { name: "Prasanna Rajan", role: "Member", points: 0 },
      { name: "Mukesh Kumar", role: "Member", points: 0 },
      { name: "Manikandan J", role: "Member", points: 0 }
    ],
    stats: {
      played: 0,
      won: 0,
      lost: 0,
      tied: 0,
      points: 0,
      nrr: "0.00",
      bonus: 0,
      form: []
    }
  },
  {
    id: "jailer",
    name: "JAILER",
    tamilName: "ஜெயிலர்",
    tagline: "Hukum... Tiger Ka Hukum!",
    badgeClass: "badge-jailer",
    accentColor: "#e2e8f0",
    secondaryColor: "#71717a",
    glowColor: "rgba(226, 232, 240, 0.35)",
    captain: "Ajay Kumar",
    viceCaptain: "Jayabalan",
    members: [
      "Balamurugan",
      "Suresh P",
      "Santhosh",
      "Vinoth Kannan",
      "Pranavathan",
      "Ramesh V"
    ],
    players: [
      { name: "Ajay Kumar", role: "Captain", points: 0 },
      { name: "Jayabalan", role: "Vice Captain", points: 0 },
      { name: "Balamurugan", role: "Member", points: 0 },
      { name: "Suresh P", role: "Member", points: 0 },
      { name: "Santhosh", role: "Member", points: 0 },
      { name: "Vinoth Kannan", role: "Member", points: 0 },
      { name: "Pranavathan", role: "Member", points: 0 },
      { name: "Ramesh V", role: "Member", points: 0 }
    ],
    stats: {
      played: 0,
      won: 0,
      lost: 0,
      tied: 0,
      points: 0,
      nrr: "0.00",
      bonus: 0,
      form: []
    }
  }
];

const DEFAULT_FIXTURES = [
  {
    id: "match-1",
    matchNo: 1,
    round: "Round 1",
    teamAId: "baasha",
    teamBId: "padayappa",
    teamAScore: "",
    teamBScore: "",
    winnerId: null,
    isTie: false,
    status: "upcoming",
    date: "Match 1",
    notes: "Clash of the Titans"
  },
  {
    id: "match-2",
    matchNo: 2,
    round: "Round 1",
    teamAId: "sivaji",
    teamBId: "petta",
    teamAScore: "",
    teamBScore: "",
    winnerId: null,
    isTie: false,
    status: "upcoming",
    date: "Match 2",
    notes: "Style vs Swag"
  },
  {
    id: "match-3",
    matchNo: 3,
    round: "Round 2",
    teamAId: "jailer",
    teamBId: "baasha",
    teamAScore: "",
    teamBScore: "",
    winnerId: null,
    isTie: false,
    status: "upcoming",
    date: "Match 3",
    notes: "Tiger meets Don"
  },
  {
    id: "match-4",
    matchNo: 4,
    round: "Round 2",
    teamAId: "padayappa",
    teamBId: "sivaji",
    teamAScore: "",
    teamBScore: "",
    winnerId: null,
    isTie: false,
    status: "upcoming",
    date: "Match 4",
    notes: "Mass vs Class"
  },
  {
    id: "match-5",
    matchNo: 5,
    round: "Round 3",
    teamAId: "petta",
    teamBId: "jailer",
    teamAScore: "",
    teamBScore: "",
    winnerId: null,
    isTie: false,
    status: "upcoming",
    date: "Match 5",
    notes: "Kaali vs Muthuvel Pandian"
  },
  {
    id: "match-6",
    matchNo: 6,
    round: "Round 3",
    teamAId: "baasha",
    teamBId: "sivaji",
    teamAScore: "",
    teamBScore: "",
    winnerId: null,
    isTie: false,
    status: "upcoming",
    date: "Match 6",
    notes: "Royalty Battle"
  },
  {
    id: "match-7",
    matchNo: 7,
    round: "Round 4",
    teamAId: "padayappa",
    teamBId: "petta",
    teamAScore: "",
    teamBScore: "",
    winnerId: null,
    isTie: false,
    status: "upcoming",
    date: "Match 4",
    notes: "Power Clash"
  },
  {
    id: "match-8",
    matchNo: 8,
    round: "Round 4",
    teamAId: "sivaji",
    teamBId: "jailer",
    teamAScore: "",
    teamBScore: "",
    winnerId: null,
    isTie: false,
    status: "upcoming",
    date: "Match 8",
    notes: "The Boss vs The Tiger"
  },
  {
    id: "match-9",
    matchNo: 9,
    round: "Round 5",
    teamAId: "baasha",
    teamBId: "petta",
    teamAScore: "",
    teamBScore: "",
    winnerId: null,
    isTie: false,
    status: "upcoming",
    date: "Match 9",
    notes: "High Voltage Drama"
  },
  {
    id: "match-10",
    matchNo: 10,
    round: "Round 5",
    teamAId: "padayappa",
    teamBId: "jailer",
    teamAScore: "",
    teamBScore: "",
    winnerId: null,
    isTie: false,
    status: "upcoming",
    date: "Match 10",
    notes: "Final League Showdown"
  }
];
