
require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const servicesData = [
  {
    title: "Land Surveying",
    description: "Accurate boundary determination for land owners and homebuyers. We ensure your property lines are clearly defined and documented.",
    icon: "Ruler",
    slug: "land-surveying",
    details: `Our Land Surveying service is the foundation of secure property ownership. We provide precise boundary determination to prevent disputes and ensure you know exactly what you own.
      
### Who is this for?
- **Homebuyers:** Verify the land size and location before purchase.
- **Landowners:** Resolve boundary disputes with neighbors.
- **Developers:** Plan subdivisions and layouts accurately.

### Our Process
1. **Research:** We review existing title documents and government records.
2. **Fieldwork:** Our team uses state-of-the-art GPS and Total Stations to measure the site.
3. **Computation:** We process the data to ensure high precision.
4. **Plan Production:** We deliver a certified survey plan recognized by SURCON.`
  },
  {
    title: "Engineering Survey",
    description: "Precision measurements for infrastructure projects including roads, bridges, and pipelines.",
    icon: "Briefcase",
    slug: "engineering-survey",
    details: `Engineering surveys are critical for the design and construction of infrastructure. We provide the precise data needed for roads, bridges, railways, and pipelines.

### Services Include:
- Route surveys for roads and pipelines.
- As-built surveys to verify construction against design.
- Setting out for buildings and structures.
- Deformation monitoring for large structures.`
  },
  {
    title: "Digital Mapping",
    description: "Creation of high-quality digital maps for planning, analysis, and architectural design.",
    icon: "Map",
    slug: "digital-mapping",
    details: `We convert physical reality into digital assets. Our digital mapping services support urban planning, environmental analysis, and architectural design.

### Deliverables:
- Topographical maps.
- 3D Terrain models.
- CAD drawings (DWG/DXF).
- Orthophotos.`
  },
  {
    title: "Property Consultant",
    description: "Expert advice on land acquisition, title perfection, and real estate development.",
    icon: "FileText",
    slug: "property-consultant",
    details: `Navigating the Nigerian real estate market can be complex. Our consultancy service guides you through land acquisition, title perfection (C of O), and regulatory compliance.

### We assist with:
- Verifying land titles at the land registry.
- Processing Certificates of Occupancy.
- Advice on land use regulations.
- Real estate development feasibility studies.`
  },
  {
    title: "GIS Solutions",
    description: "Data-driven spatial analysis and solutions for informed decision-making.",
    icon: "Globe",
    slug: "gis-solutions",
    details: `Our GIS solutions empower organizations to visualize, analyze, and interpret data to understand relationships, patterns, and trends.

### Applications:
- Asset management.
- Environmental impact assessment.
- Site selection analysis.
- Urban planning and zoning.`
  }
];

const projectsData = [
  {
    title: "Lagos Residential Layout",
    category: "Land Surveying",
    location: "Lekki, Lagos",
    description: "Complete boundary survey and layout design for a 50-hectare residential estate.",
    image: "/images/20250515_134156.jpg.jpeg"
  },
  {
    title: "Abuja Highway Topography",
    category: "Topographical",
    location: "Abuja FCT",
    description: "Detailed topographical survey for a 10km road expansion project.",
    image: "/images/20250516_104441.jpg.jpeg"
  },
  {
    title: "Port Harcourt Bridge Construction",
    category: "Engineering",
    location: "Port Harcourt, Rivers",
    description: "Precision setting out and monitoring for a major bridge construction.",
    image: "/images/engineering_survey.png"
  },
  {
    title: "Ogun State GIS Mapping",
    category: "GIS",
    location: "Abeokuta, Ogun",
    description: "Development of a GIS database for urban planning and land administration.",
    image: "/images/20260204_120452.jpg.jpeg"
  }
];

const teamData = [
  {
    name: "Surv. John Doe",
    position: "Principal Surveyor",
    surcon_number: "F001",
    image: "/images/IMG-20260113-WA0012.jpg.jpeg",
    bio: "Principal Surveyor with over 20 years of experience."
  },
  {
    name: "Surv. Jane Smith",
    position: "Senior Surveyor",
    surcon_number: "F002",
    image: "/images/IMG-20260113-WA0016.jpg.jpeg",
    bio: "Expert in cadastral and engineering surveys."
  },
  {
    name: "Engr. Michael Johnson",
    position: "GIS Analyst",
    surcon_number: "F003",
    image: "/images/IMG-20260129-WA0005.jpg.jpeg",
    bio: "Specialist in GIS and remote sensing."
  }
];

async function seed() {
  const client = await pool.connect();
  try {
    console.log('Starting seed...');
    await client.query('BEGIN');

    // 1. Create Admin User
    // Change these credentials for production!
    const email = 'admin@sourceline.com';
    const password = 'adminpassword123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userCheck = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length === 0) {
      await client.query(
        'INSERT INTO users (email, password, role) VALUES ($1, $2, $3)',
        [email, hashedPassword, 'admin']
      );
      console.log(`Admin user created: ${email} / ${password}`);
    } else {
      console.log('Admin user already exists');
    }

    // 2. Seed Services
    for (const service of servicesData) {
      // Check if exists by slug
      const check = await client.query('SELECT * FROM services WHERE slug = $1', [service.slug]);
      if (check.rows.length === 0) {
        await client.query(
          'INSERT INTO services (title, description, icon, slug, details) VALUES ($1, $2, $3, $4, $5)',
          [service.title, service.description, service.icon, service.slug, service.details]
        );
      }
    }
    console.log('Services seeded');

    // 3. Seed Projects
    for (const project of projectsData) {
      const check = await client.query('SELECT * FROM projects WHERE title = $1', [project.title]);
      if (check.rows.length === 0) {
        await client.query(
          'INSERT INTO projects (title, category, location, image, description) VALUES ($1, $2, $3, $4, $5)',
          [project.title, project.category, project.location, project.image, project.description]
        );
      }
    }
    console.log('Projects seeded');

    // 4. Seed Team
    for (const member of teamData) {
      const check = await client.query('SELECT * FROM team_members WHERE name = $1', [member.name]);
      if (check.rows.length === 0) {
        await client.query(
          'INSERT INTO team_members (name, position, surcon_number, image, bio) VALUES ($1, $2, $3, $4, $5)',
          [member.name, member.position, member.surcon_number, member.image, member.bio]
        );
      }
    }
    console.log('Team members seeded');

    await client.query('COMMIT');
    console.log('Seed completed successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed failed:', err);
  } finally {
    client.release();
    pool.end();
  }
}

seed();
