
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const services = [
  {
    title: "Boundary Surveys",
    description: "Precise determination of property lines and corners. Essential for buying, selling, or resolving disputes.",
    icon: "Ruler",
    slug: "boundary-surveys",
    details: "Our boundary surveys use state-of-the-art equipment to locate and verify property corners and boundary lines. We provide detailed plans that meet all SURCON requirements."
  },
  {
    title: "Topographic Surveys",
    description: "Detailed mapping of natural and man-made features on the land. Crucial for engineering and architectural design.",
    icon: "Map",
    slug: "topographic-surveys",
    details: "We capture the 3D features of your site, including elevations, contours, trees, buildings, and utilities. This data is the foundation for any successful construction project."
  },
  {
    title: "Engineering Surveys",
    description: "Support for construction projects, including setting out, as-built surveys, and monitoring.",
    icon: "HardHat",
    slug: "engineering-surveys",
    details: "From initial site control to final as-built verification, our engineering surveys ensure your construction project is built exactly according to design specifications."
  },
  {
    title: "GIS & Mapping",
    description: "Geographic Information Systems solutions for data analysis, management, and visualization.",
    icon: "Globe",
    slug: "gis-mapping",
    details: "We turn complex spatial data into actionable insights. Our GIS services include database creation, spatial analysis, and custom map production for planning and decision-making."
  },
  {
    title: "Hydrographic Surveys",
    description: "Mapping of underwater features for dredging, port construction, and offshore projects.",
    icon: "Anchor",
    slug: "hydrographic-surveys",
    details: "Using echo sounders and GPS, we map the bed of water bodies to determine depth and morphology, supporting safe navigation and marine construction."
  },
  {
    title: "Route Surveys",
    description: "Surveying for linear projects like roads, pipelines, and transmission lines.",
    icon: "MapPin",
    slug: "route-surveys",
    details: "We provide comprehensive route surveys including reconnaissance, preliminary, and final location surveys for infrastructure development."
  }
];

const projects = [
  {
    title: "Lagos Coastal Road Survey",
    category: "Infrastructure",
    location: "Lekki, Lagos",
    image: "/images/20250516_111224.jpg.jpeg",
    description: "Comprehensive topographic and route survey for the proposed coastal road expansion project."
  },
  {
    title: "Banana Island Estate Mapping",
    category: "Residential",
    location: "Ikoyi, Lagos",
    image: "/images/dji_fly_20260128_125210_0_1769601130705_photo_low_quality.jpg.jpeg",
    description: "High-precision boundary and topographic mapping for a new luxury residential development."
  },
  {
    title: "Eko Atlantic City Layout",
    category: "Urban Planning",
    location: "Victoria Island, Lagos",
    image: "/images/20250516_130158.jpg.jpeg",
    description: "Setting out and layout survey for a new mixed-use district within Eko Atlantic City."
  },
  {
    title: "Dangote Refinery Pipeline Route",
    category: "Industrial",
    location: "Ibeju-Lekki, Lagos",
    image: "/images/20250515_134156.jpg.jpeg",
    description: "Route survey and right-of-way acquisition support for major pipeline infrastructure."
  }
];

const teamMembers = [
  {
    name: "Surv. Adekunle Johnson",
    position: "Principal Partner",
    surcon_number: "S.1234",
    image: "/images/IMG-20260113-WA0012.jpg.jpeg",
    bio: "Over 20 years of experience in land surveying and geoinformatics. Fellow of the Nigerian Institution of Surveyors."
  },
  {
    name: "Surv. Chioma Okeke",
    position: "Head of Operations",
    surcon_number: "S.2345",
    image: "/images/IMG-20260113-WA0016.jpg.jpeg",
    bio: "Expert in engineering surveying and project management. Leads our field operations with precision and efficiency."
  },
  {
    name: "Engr. Tunde Bakare",
    position: "Senior GIS Analyst",
    surcon_number: null,
    image: "/images/IMG-20260129-WA0005.jpg.jpeg",
    bio: "Specializes in spatial data analysis and digital mapping. Transforms complex data into actionable insights."
  },
  {
    name: "Surv. Musa Ibrahim",
    position: "Project Surveyor",
    surcon_number: "S.3456",
    image: "/images/20260204_120313.jpg.jpeg",
    bio: "Focuses on cadastral and boundary surveys. Ensures all legal requirements for land documentation are met."
  },
  {
    name: "Grace Ojo",
    position: "Administrative Manager",
    surcon_number: null,
    image: "/images/image.png",
    bio: "Keeps our office running smoothly and ensures excellent client communication and service delivery."
  },
  {
    name: "David West",
    position: "Field Surveyor",
    surcon_number: null,
    image: "/images/20250516_104441.jpg.jpeg",
    bio: "Experienced in topographic surveys and site setting out. Dedicated to accuracy in the field."
  },
  {
    name: "Sarah Nwachukwu",
    position: "CAD Technician",
    surcon_number: null,
    image: "/images/isimi/WhatsApp Image 2026-02-10 at 3.16.20 PM.jpeg",
    bio: "Expert in AutoCAD and survey plan production. Translates field data into clear, accurate plans."
  },
  {
    name: "Emmanuel Cole",
    position: "Drone Pilot / Surveyor",
    surcon_number: null,
    image: "/images/dji_fly_20260128_125210_0_1769601130705_photo_low_quality.jpg.jpeg",
    bio: "Certified drone pilot specializing in aerial mapping and photogrammetry for large-scale projects."
  },
  {
    name: "Femi Adebayo",
    position: "Assistant Surveyor",
    surcon_number: null,
    image: "/images/20250515_134229.jpg.jpeg",
    bio: "Supporting field teams with equipment handling and data collection. Aspiring registered surveyor."
  },
  {
    name: "Ngozi Eze",
    position: "Client Relations Officer",
    surcon_number: null,
    image: "/images/isimi/WhatsApp Image 2026-02-10 at 3.30.16 PM (1).jpeg",
    bio: "First point of contact for our clients. Ensures your needs are understood and met promptly."
  },
  {
    name: "Ahmed Sani",
    position: "Logistics Coordinator",
    surcon_number: null,
    image: "/images/isimi/WhatsApp Image 2026-02-10 at 3.30.20 PM (1).jpeg",
    bio: "Manages equipment deployment and team mobilization to ensuring projects start on time."
  },
  {
    name: "Bisi Akindele",
    position: "Legal Liaison",
    surcon_number: null,
    image: "/images/isimi/WhatsApp Image 2026-02-10 at 3.30.21 PM (1).jpeg",
    bio: "Works with legal teams to ensure all survey documentation supports land title processing."
  }
];

async function seed() {
  const client = await pool.connect();
  try {
    console.log('Starting database seed...');
    await client.query('BEGIN');

    // Seed Services
    console.log('Seeding Services...');
    for (const service of services) {
      const res = await client.query('SELECT id FROM services WHERE title = $1', [service.title]);
      if (res.rows.length === 0) {
        await client.query(
          'INSERT INTO services (title, description, icon, slug, details) VALUES ($1, $2, $3, $4, $5)',
          [service.title, service.description, service.icon, service.slug, service.details]
        );
      }
    }

    // Seed Projects
    console.log('Seeding Projects...');
    for (const project of projects) {
      const res = await client.query('SELECT id FROM projects WHERE title = $1', [project.title]);
      if (res.rows.length === 0) {
        await client.query(
          'INSERT INTO projects (title, category, location, image, description) VALUES ($1, $2, $3, $4, $5)',
          [project.title, project.category, project.location, project.image, project.description]
        );
      }
    }

    // Seed Team Members
    console.log('Seeding Team Members...');
    for (const member of teamMembers) {
      const res = await client.query('SELECT id FROM team_members WHERE name = $1', [member.name]);
      if (res.rows.length === 0) {
        await client.query(
          'INSERT INTO team_members (name, position, surcon_number, image, bio) VALUES ($1, $2, $3, $4, $5)',
          [member.name, member.position, member.surcon_number, member.image, member.bio]
        );
      }
    }

    await client.query('COMMIT');
    console.log('Database seed completed successfully.');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Seed failed:', e);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
