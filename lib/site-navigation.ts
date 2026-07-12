export type NavigationItem={label:string;href:string;status?:"pending"};
export type NavigationGroup={label:string;description:string;href:string;items:NavigationItem[]};

export const SITE_NAVIGATION:NavigationGroup[]=[
  {
    label:"About",
    description:"People, policies and general symposium information.",
    href:"/about",
    items:[
      {label:"Committee",href:"/committee"},
      {label:"Contact Us",href:"/contact"},
      {label:"Code of Conduct",href:"/code-of-conduct"},
      {label:"Letter from the Chairs",href:"/letter-from-chairs",status:"pending"},
      {label:"General Information",href:"/about"},
      {label:"Download the App",href:"/event-app",status:"pending"},
      {label:"Event Highlights",href:"/highlights"},
    ],
  },
  {
    label:"Technical Program",
    description:"Themes, programme structure, speakers and technical formats.",
    href:"/programme",
    items:[
      {label:"Technical Program",href:"/programme"},
      {label:"Conference at a Glance",href:"/programme#at-a-glance"},
      {label:"Speakers",href:"/speakers"},
      {label:"Opening Plenary Session",href:"/programme#opening-plenary",status:"pending"},
      {label:"Panels and Special Sessions",href:"/programme#panels-special-sessions",status:"pending"},
      {label:"Topical Luncheons",href:"/programme#topical-luncheons",status:"pending"},
      {label:"Short Course",href:"/programme#short-course",status:"pending"},
      {label:"New Technology Showcase",href:"/programme#technology-showcase",status:"pending"},
      {label:"Core Exhibits",href:"/programme#core-exhibits",status:"pending"},
      {label:"Technical Themes",href:"/technical-themes"},
      {label:"Resources and Downloads",href:"/resources"},
    ],
  },
  {
    label:"Register & Travel",
    description:"Registration, accommodation and travel planning.",
    href:"/register",
    items:[
      {label:"Registration Information",href:"/register"},
      {label:"Accommodations",href:"/travel#accommodations",status:"pending"},
      {label:"Travel and Transportation",href:"/travel#transportation",status:"pending"},
      {label:"Venue Information",href:"/travel#venue",status:"pending"},
    ],
  },
  {
    label:"Exhibit & Sponsor",
    description:"Exhibition, sponsorship and commercial participation.",
    href:"/sponsors",
    items:[
      {label:"Exhibit Space",href:"/sponsors#exhibit-space",status:"pending"},
      {label:"Sponsorship Opportunities",href:"/sponsors#sponsorship-opportunities",status:"pending"},
      {label:"Exhibitor List and Floor Plan",href:"/sponsors#exhibitor-list",status:"pending"},
      {label:"Sponsors",href:"/sponsors#sponsors",status:"pending"},
      {label:"Exhibitor Manual",href:"/sponsors#exhibitor-manual",status:"pending"},
      {label:"Brand Builders",href:"/sponsors#brand-builders",status:"pending"},
      {label:"Exhibitor Registration",href:"/sponsors#exhibitor-registration",status:"pending"},
    ],
  },
];
