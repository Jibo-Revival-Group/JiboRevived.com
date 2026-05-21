const projectProgress = {
  percentage: 75
};

const authors = {
  kk: { name: "Kevin Kor", initials: "KK", pfp: "assets/pfp/kevin.png", url: "https://kevinblog.sytes.net/", role: "Project Lead & Organizer" },
  jk: { name: "Jaked", initials: "JK", pfp: "assets/pfp/jake.webp", role: "OpenJibo Server Maintainer" },
  mc: { name: "Marcel", initials: "MC", pfp: "assets/pfp/marcel.webp", url: "https://www.mgdproductions.com/", role: "" },
  rg: { name: "RobotGuy", initials: "RG", pfp: "assets/pfp/robotguy.webp", role: "" },
  ww: { name: "Wyatt Woolford", initials: "WW", pfp: "assets/pfp/wyatt.webp", role: "Server Booster" },
  zm: { name: "Zetoman", initials: "ZM", pfp: "assets/pfp/zetoman.webp", role: "" },
  ps: { name: "Padre_San", initials: "PS", pfp: "assets/pfp/padre_san.webp", role: "" },
  sd: {
    name: "Alex Rose (aka Jibo Dentist)",
    initials: "AR",
    pfp: "assets/pfp/dentist.webp",
    role: "Website Help"
  },
  dm: {
    name: "Demme",
    initials: "DM",
    pfp: "assets/pfp/demme.webp",
    pro: "she/they",
    role: "Community Manager & Assist"
  },
  zv: {
    name: "ZaneDev",
    initials: "ZV",
    pfp: "assets/pfp/zane.jpeg",
    url: "https://zane.org",
    pro: "they/he/she",
    role: "Contributor & 5x1 (OpenJibo) Host"
  },
  jc: { name: "JackCain", pfp: "assets/pfp/jack.webp", initials: "JC", role: "" },
};

const commits = [
  {
    date: "2026-03-15",
    categories: ["RCM", "Firmware"],
    summary: "Abusing the RCM to access eMMC. Was able to read the entire eMMC, and from there enter a developer mode.",
    authors: ["kk", "zv"]
  },
  {
    date: "2026-03-03",
    categories: ["Board", "Firmware"],
    summary: "BOOTROM dump was a lost battle. The team is currently trying to get a custom version of U-Boot working.",
    authors: ["kk"]
  }
];
