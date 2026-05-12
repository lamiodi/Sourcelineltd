# Project Blueprint

## Overview
[Description of the project]

## Architecture

## Tasks
Here's a refined version of the website blueprint for Sourceline Limited. The structure remains the same, with enhancements for clarity, readability, and professionalism.

---

```markdown
# Website Blueprint: Sourceline Limited

## 1. Project Overview & Goals

This document serves as the blueprint for the official website of Sourceline Limited, a registered land surveying firm in Nigeria. 

The primary goals of the website are:
1. **Establish Professional Credibility:** Present Sourceline Limited as a trusted, expert land surveying firm.
2. **Generate Qualified Leads:** Provide potential clients with easy access to request quotes and schedule consultations.
3. **Build Trust & Combat Scams:** Ensure the website is a trusted, scam-proof resource, giving clients confidence in its legitimacy.
4. **Maintain Regulatory Compliance:** Ensure the site aligns with SURCON advertising regulations.

---

## 2. Core Guiding Principles

Every design, content, and functionality decision will adhere to the following principles:

- **Transparency:** Present all verifiable information clearly and upfront.
- **Professionalism:** Reflect the firm’s standing through a polished and functional website.
- **User Education:** Provide valuable, informative content that positions Sourceline Limited as a resource.
- **Security:** Implement robust security measures to protect both the firm and its users.

---

## 3. Website Sitemap (Structure)

```

├── 1. Homepage (/)
├── 2. About Us (/about)
├── 3. Our Services (/services)
│   ├── Land & Boundary Surveying
│   ├── Topographical Surveys
│   ├── Engineering Surveys
│   └── Title Registration Support
├── 4. Projects & Portfolio (/portfolio)
├── 5. Verify Our Legitimacy (/verify) **[KEY ANTI-SCAM PAGE]**
├── 6. Blog & Resources (/blog)
├── 7. Contact Us (/contact)
└── 8. Footer (Present on all pages)

```

---

## 4. Page-by-Page Breakdown

### 4.1. Homepage (/)
- **Purpose:** Make a strong first impression and direct users to key areas.
- **Key Components:**
    - **Hero Section:** Image of a surveyor at work with the headline: "Precision. Integrity. Your Trusted Land Surveyors in Nigeria."
    - **Trust Bar:** Display key logos/numbers like "Registered with SURCON," "CAC Certified," "15+ Years Experience."
    - **Services Overview:** Brief summaries of core services with links to the full Services page.
    - **"Why Choose Sourceline?" Section:** Highlight key points such as "Registered Professionals," "Transparent Pricing," "Unmatched Accuracy."
    - **Featured Projects:** Carousel showcasing 3 recent successful projects.
    - **Client Testimonials:** A rotating slider with 2-3 client testimonials.
    - **CTA:** "Request a Free, No-Obligation Quote" button prominently displayed.
- **Primary CTA:** "Request a Quote"

### 4.2. About Us (/about)
- **Purpose:** Share Sourceline Limited's story, introduce the team, and humanize the brand.
- **Key Components:**
    - **Our Story:** A narrative about the company’s founding and values.
    - **Meet the Team:** Professional headshots and bios of key team members, including **SURCON license numbers**.
    - **Core Values:** Emphasize values like Integrity, Accuracy, Client Focus, and Professionalism.
    - **Company Registration:** Include company name and CAC RC number.
- **Primary CTA:** "Meet Our Experts" (links to team section) or "View Our Work" (links to Portfolio).

### 4.3. Our Services (/services)
- **Purpose:** Provide clear, detailed descriptions of each service offered.
- **Key Components:**
    - **Main Service Page:** Overview of all services.
    - **Individual Service Pages:**
        - **Land & Boundary Surveying:** Detail the service, target audience (e.g., homebuyers, landowners), and process.
        - **Engineering Surveying:** Precise measurements for roads, bridges, and infrastructure development.
        - **Digital Mapping:** Creation of high-quality digital maps for planning and analysis.
        - **Property Consultancy:** Expert advice on land acquisition, title perfection, and real estate development.
        - **Geographical Information System (GIS) & Management:** Data-driven spatial analysis and resource management solutions.
        - **Landscaping:** Site planning and environmental design for aesthetic and functional outdoor spaces.
    - All descriptions should avoid superlatives to remain **SURCON** compliant.
- **Primary CTA:** "Get a Quote for This Service"

### 4.4. Projects & Portfolio (/portfolio)
- **Purpose:** Showcase the firm’s expertise and past work.
- **Key Components:**
    - **Filterable Gallery:** Allow users to filter projects by type (Residential, Commercial, Industrial) or service.
    - **Project Case Studies:** Include:
        - High-quality images.
        - Client name (with permission).
        - Location.
        - Scope of work.
        - Brief "Challenge & Solution" description.
- **Primary CTA:** "Discuss a Similar Project"

### 4.5. Verify Our Legitimacy (/verify) **[CRITICAL PAGE]**
- **Purpose:** Provide undeniable proof of Sourceline Limited’s authenticity and combat any trust issues.
- **Key Components:**
    - **Headline:** "Your Trust is Our Priority. Verify Sourceline Limited Here."
    - **Corporate Affairs Commission (CAC):**
        - Full Company Name: **Sourceline Limited**
        - RC Number: `[Insert CAC RC Number Here]`
        - **Button:** "Verify on CAC Portal" (links to search.cac.gov.ng).
    - **Surveyors Council of Nigeria (SURCON):**
        - Statement of registration.
        - List of Principal Surveyors with **SURCON License Numbers**.
        - **Button:** "Verify on SURCON Portal" (link to SURCON or instructions).
    - **Physical Office:** 
        - Full Address and **Embedded Google Map**.
        - Text: "We welcome clients to visit our office during business hours."
    - **Bank Account Information:**
        - Statement: "Payments are made ONLY to our official corporate account."
        - Bank: `[Insert Bank Name]`
        - Note: "Account details provided on official invoices."
- **Primary CTA:** "Contact Us to Confirm Details"

### 4.6. Blog & Resources (/blog)
- **Purpose:** Educate users, build authority, and improve SEO.
- **Key Components:**
    - List of articles:
        - "Red Flags to Watch For When Buying Land in Nigeria"
        - "Understanding Your Survey Plan"
        - "Topographical Surveys and Construction"
    - **Primary CTA:** "Subscribe to Our Newsletter" or "Read More"

### 4.7. Contact Us (/contact)
- **Purpose:** Facilitate communication with potential clients.
- **Key Components:**
    - **Contact Form:** Fields for Name, Phone, Email, Location of Land, and Service Request. Include Google reCAPTCHA.
    - **Direct Contact Info:** 
        - Phone (clickable): `[Insert Phone Number]`
        - Email (clickable): `info@sourcelinelimited.com.ng`
    - **Office Hours:** Clearly stated.
    - **Embedded Map:** Google Map showing the office.
- **Primary CTA:** "Send Message"

### 4.8. Admin Dashboard (/admin)
- **Purpose:** Manage website content dynamically.
- **Key Components:**
    - **Login Screen:** Secure authentication (Supabase Auth).
    - **Dashboard Overview:** Quick stats (Total Projects, Total Services).
    - **Manage Services:**
        - **Add New Service:** Form to input Service Title, Description, Icon, and Details.
        - **Edit/Delete Service:** List of existing services with action buttons.
    - **Manage Projects:** Add or update portfolio items (Images, Descriptions, Location).
- **Security:** Protected route, accessible only by authenticated admin users.

### 4.9. Footer (Global)
- **Purpose:** Provide consistent access to essential links.
- **Key Components:**
    - Company Logo
    - Short Description
    - Quick Links (Home, About, Services, Contact)
    - Contact Info (Phone, Email, Address)
    - **Crucial Trust Links:** "Verify Our Legitimacy" and "Payment Policy"
    - Social Media Links (LinkedIn, if applicable)
    - Copyright Notice: © [Current Year] Sourceline Limited. All Rights Reserved.

---

## 5. Technical & Branding Requirements

- **Domain Name:** `sourcelinelimited.com.ng`
- **SSL Certificate:** HTTPS for security and trust.
- **Professional Email:** Use company domain.
- **Design:** Clean, modern, mobile-first design.
- **Tech Stack:**
    - **Frontend:** React (Vite) for a fast, interactive user interface.
    - **Backend:** Node.js (Express) for custom API endpoints.
    - **Database & Auth:** Supabase for real-time data, authentication, and storage.
- **Performance:** Ensure fast load times and optimized assets.
- **Security:** Secure API endpoints, Row Level Security (RLS) in Supabase.

---

## 6. Content & SEO Strategy

- **Target Keywords:** "Land surveyor Lagos," "Topographical survey Nigeria," "Sourceline Limited," etc.
- **Local SEO:** Optimize Google Business Profile.
- **Content Plan:** Publish one new blog post per month to enhance authority.

---

## 7. Final Compliance Note

**IMPORTANT:** Before launching, ensure final content complies with the **SURCON Code of Conduct and Ethics**. This blueprint is designed for compliance, but the responsibility lies with Sourceline Limited for final approval.
```

This refined blueprint enhances clarity, coherence, and professionalism, aligning well with Sourceline Limited's goals and the needs of its target audience.
