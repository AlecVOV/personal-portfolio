// import type { Project, Skill, Education, Experience, Certification, Field, BlogPost } from '~/types/portfolio'

// export const usePortfolioData = () => {
//   const fields: Field[] = [
//     {
//       title: 'Machine Learning',
//       description: 'Currently exploring various ML algorithms and their applications, eager to apply this knowledge in a real-world industry.'
//     },
//     {
//       title: 'Cloud Computing',
//       description: 'Learning about cloud platforms like AWS, excited to work with cloud technologies in a professional setting to deploy the best practise model pipline.'
//     },
//     {
//       title: 'Deep Learning',
//       description: 'Diving into neural networks and deep learning architectures, keen to contribute to innovative projects as an intern.'
//     },
//     {
//       title: 'Data Engineering',
//       description: 'Understanding data pipelines and processing systems, looking forward to gaining hands-on experience in data engineering during an internship.'
//     }
//   ]

//   const education: Education[] = [
//     {
//       degree: 'Bachelor of Computer Science, Majoring in Artificial Intelligence',
//       school: 'Swinburne University of Technology',
//       year: '2023-2027',
//       description: 'Mastered AI fundamentals at Swinburne Vietnam, delivering impactful solutions in collaboration with industry partners.'
//     }
//   ]

//   const experience: Experience[] = [
//     {
//       title: 'AL/ML Ambassador',
//       company: 'AWS Study Group',
//       period: '2025 - Now',
//       description:'Actively participated in workshops and events to foster growth and collaboration within the AWS community.'
//     },
//     {
//       title: 'Member of AIO 2024',
//       company: 'AI Vietnam',
//       period: '2024-2025',
//       description: 'Intensive 1-year program with diverse projects in image processing, natural language processing, and data science, showcasing practical skills from python, algorithms, machine learning, and real-world project applications.'
//     }
//   ]

//   const skills: Skill[] = [
//     { name: 'Python', icon: 'https://cdn.jsdelivr.net/gh/tandpfun/skill-icons/icons/Python-Light.svg' },
//     { name: 'AWS', icon: 'https://cdn.jsdelivr.net/gh/tandpfun/skill-icons/icons/AWS-Light.svg' },
//     { name: 'Github', icon: 'https://cdn.jsdelivr.net/gh/tandpfun/skill-icons/icons/Github-Light.svg' },
//     { name: 'Git', icon: 'https://cdn.jsdelivr.net/gh/tandpfun/skill-icons/icons/Git.svg' },
//     { name: 'LaTeX', icon: 'https://cdn.jsdelivr.net/gh/tandpfun/skill-icons/icons/LaTeX-Light.svg' },
//     { name: 'Stack Overflow', icon: 'https://cdn.jsdelivr.net/gh/tandpfun/skill-icons/icons/StackOverflow-Light.svg' },
//     { name: 'Nuxt', icon: 'https://cdn.jsdelivr.net/gh/tandpfun/skill-icons/icons/NuxtJS-Light.svg' },
//     { name: 'Vite', icon: 'https://cdn.jsdelivr.net/gh/tandpfun/skill-icons/icons/Vite-Light.svg' },
//     { name: 'Vue', icon: 'https://cdn.jsdelivr.net/gh/tandpfun/skill-icons/icons/VueJS-Light.svg' }
//   ]

//   const certifications: Certification[] = [
//     {
//       id: '1',
//       name: 'CCNA: Introduction to Networks',
//       issuer: 'Cisco',
//       date: 'April 2024',
//       link: 'https://www.credly.com/badges/ea475619-7376-44f1-9bba-162b836b9c48'
//     },
//     {
//       id: '2',
//       name: 'Programming for Everybody (Getting Started with Python)',
//       issuer: 'University of Michigan',
//       date: 'October 2024',
//       link: 'https://coursera.org/share/5ee62f4961be5e83b3d118d4ef28e6a6'
//     },
//     {
//       id: '3',
//       name: 'AWS Academy Graduate - AWS Academy Cloud Foundations',
//       issuer: 'Amazon Web Services',
//       date: 'October 2024',
//       link: 'https://www.credly.com/badges/988c98b4-6507-4e49-b2d2-6093db2310fa'
//     },
//     {
//       id: '4',
//       name: 'Getting Started with Data Analytics on AWS',
//       issuer: 'Amazon Web Services',
//       date: 'December 2024',
//       link: 'https://coursera.org/share/d50e9b9c27fafd6c418db51ff6c888f9'
//     },
//     {
//       id: '5',
//       name: 'Optimizing Your Workflow with GitHub Copilot and VS Code',
//       issuer: 'Microsoft',
//       date: 'January 2025',
//       link: 'https://www.coursera.org/account/accomplishments/verify/YBWSR92GPAJ8'
//     },
//     {
//       id: '6',
//       name: 'Generative AI for Software Developers',
//       issuer: 'Microsoft',
//       date: 'January 2025',
//       link: 'https://www.coursera.org/account/accomplishments/specialization/9CB53RS5NSHP'
//     },
//     {
//       id: '7',
//       name: 'Introduction to Generative AI for Developers With Copilot',
//       issuer: 'Microsoft',
//       date: 'January 2025',
//       link: 'https://www.coursera.org/account/accomplishments/verify/MZR1Q0AOHTWY'
//     },
//     {
//       id: '8',
//       name: 'GitHub Copilot for Project Management',
//       issuer: 'Microsoft',
//       date: 'January 2025',
//       link: 'https://www.coursera.org/account/accomplishments/verify/DMGSURXKUNU3'
//     },
//     {
//       id: '9',
//       name: 'Boost Your Productivity with GitHub Copilot ',
//       issuer: 'Microsoft',
//       date: 'January 2025',
//       link: 'https://www.coursera.org/account/accomplishments/verify/HILQUP63LI3V'
//     },
//     {
//       id: '10',
//       name: 'Foundations of Software Testing and Validation',
//       issuer: 'University of Leeds',
//       date: 'January 2025',
//       link: 'https://www.coursera.org/account/accomplishments/verify/0IG2WUQ0FEYX'
//     },
//     {
//       id: '11',
//       name: 'Preview Cloud Computing Terms Every Beginner Should Know',
//       issuer: 'LinkedIn Learning',
//       date: 'January 2025',
//       link: 'https://lnkd.in/ggGxWyQm'
//     },
//     {
//       id: '12',
//       name: 'AWS Educate Introduction to Cloud 101',
//       issuer: 'AWS Educate',
//       date: 'January 2025',
//       link: 'https://www.credly.com/badges/5dba24be-3931-406f-9a36-5b6b2617983e'
//     },
//     {
//       id: '13',
//       name: 'AWS Educate Getting Started with Storage',
//       issuer: 'AWS Educate',
//       date: 'January 2025',
//       link: 'https://www.credly.com/badges/53778c52-ddf0-4526-9bd6-5e80b0eb9686'
//     },
//     {
//       id: '14',
//       name: 'Programming with JavaScript',
//       issuer: 'Meta',
//       date: 'February 2025',
//       link: 'https://www.coursera.org/account/accomplishments/verify/UBMKWRTFHD55'
//     },
//     {
//       id: '15',
//       name: 'Migrating to the AWS Cloud',
//       issuer: 'Amazon Web Services',
//       date: 'February 2025',
//       link: 'https://www.coursera.org/account/accomplishments/verify/BJ7IR8L23Z6B'
//     },
//     {
//       id: '16',
//       name: 'AWS Cloud Technical Essentials',
//       issuer: 'Amazon Web Services',
//       date: 'February 2025',
//       link: 'https://www.coursera.org/account/accomplishments/verify/TWEQ110OPW4C'
//     },
//     {
//       id: '17',
//       name: 'Introduction to Data Analytics',
//       issuer: 'IBM',
//       date: 'February 2025',
//       link: 'https://www.coursera.org/account/accomplishments/verify/I1F8C74GWSN2'
//     }
//   ]

//   const projects: Project[] = [
//     {
//       title: 'Queensland Road Safety Analysis',
//       description: 'An analysis and visualization of road safety data in Queensland, Australia.',
//       image: 'Queensland Road Safety Analysis.png',
//       category: ['Data Visualization'],
//       demo: '#',
//       github: 'https://github.com/AlecVOV/My-Side-Project/tree/main/Queensland%20Road%20Safety%20Analysis'
//     },
//     {
//       title: 'IBM Employee Attrition & Performance Analysis',
//       description: 'An analysis using Python and visualization using PowerBI.',
//       image: 'IBM.webp',
//       category: ['Predictive Modeling', 'Business Intelligence'],
//       demo: '#',
//       github: 'https://github.com/AlecVOV/My-Side-Project/tree/main/IBM%20Employee%20Attrition%20%26%20Performance%20Analysis'
//     },
//     {
//       title: 'Apply ML for Used Car Price Estimation for Eureka Motors',
//       description: 'A set of machine learning models to estimate used car prices for Eureka Motors.',
//       image: 'Car_Prediction.png',
//       category: ['Machine Learning'],
//       demo: '#',
//       github: 'https://github.com/AlecVOV/My-Side-Project/tree/main/Apply%20ML%20for%20Used%20Car%20Price%20Estimation%20for%20Eureka%20Motors'
//     },
//     {
//       title: 'Web Scraping Project',
//       description: 'A python script to scrape data from a website and store it in a CSV file.',
//       image: 'web-scraping.jpg',
//       category: ['Web Scraping'],
//       demo: '#',
//       github: 'https://github.com/AlecVOV/Self-Project/tree/main/Web%20Scrawing%20Python'
//     },
//     {
//       title: 'Snake Game Project',
//       description: 'Fully functional snake game built with GenAI (Amazon Q).',
//       image: 'snake_game_logo.webp',
//       category: ['Generative AI'],
//       demo: '#',
//       github: 'https://github.com/AlecVOV/Self-Project/tree/main/Snake%20Game%20Project'
//     },
//     {
//       title: 'Ice Cream Website',
//       description: 'Complete Assignment 2 of COS10005 unit.',
//       image: 'Ice Cream Website.png',
//       category: ['Front End Development'],
//       demo: '#',
//       github: 'https://github.com/AlecVOV/Projects/tree/main/Ice%20Cream%20Website'
//     },
//     {
//       title: 'Recruitment Website For HR',
//       description: 'Complete website for COS10026 Unit',
//       image: 'Recruitment Website For HR.png',
//       category: ['Front End Development'],
//       demo: '#',
//       github: 'https://github.com/AlecVOV/Projects/tree/main/Recruitment%20Website%20For%20HR'
//     },
//     {
//       title: 'Software Vulnerability Detection by Reconnaise.ai',
//       description: 'A fully functional website can detect vulnerable PHP code using 6 machine learning models implementation',
//       image: 'Sofware Vulnerability Detection.png',
//       category: ['Machine Learning'],
//       demo: '#',
//       github: 'https://github.com/AlecVOV/Projects/tree/main/Software%20Vulnerability%20Detection%20(Reconnaise.ai)'
//     },
//     {
//       title: 'Koala Analysis',
//       description: 'A side project for practice about Koala analysis.',
//       image: 'Koala Analysis.png',
//       category: ['Data Analysis'],
//       demo: '#',
//       github: 'https://github.com/AlecVOV/My-Side-Project/tree/main/Koala%20Morphological%20Characteristics%20and%20Demographics%20Analysis'
//     },
//     {
//       title: 'KPIs and Sales Profit of OfficeWorld',
//       description: 'Side project using PowerBI to create dashboard',
//       image: 'KPIs Sale OfficeWorld.png',
//       category: ['Data Visualization'],
//       demo: '#',
//       github: 'https://github.com/AlecVOV/My-Side-Project/tree/main/KPIs%20and%20Sales%20Profit%20of%20OfficeWorld'
//     },
//     {
//       title: 'Predictive Model with Tax Revenue and Guest Night',
//       description: 'Basic data mining and implementation MLs to predict cost',
//       image: 'Tax Revenue and Hotel.png',
//       category: ['Machine Learning, Data Mining'],
//       demo: '#',
//       github: 'https://github.com/AlecVOV/My-Side-Project/tree/main/Predictive%20Model%20with%20Tax%20Revenue%20and%20Guest%20Night'
//     },
//     {
//       title: 'Tea-related Business Analysis with Tableau',
//       description: 'Comprehensive data analysis and visualization of tea business operations across multiple US states using Tableau',
//       image: 'Tea-Related-Bizniz.png',
//       category: ['Data Visualization'],
//       demo: '#',
//       github: 'https://github.com/AlecVOV/My-Side-Project/tree/main/Tea-related%20Business%20Analysis%20with%20Tableau'
//     },
//     {
//       title: 'Applied Predictive Analytics with Dead Stock',
//       description: 'Analyzes inventory data from Australian warehouses to predict which items are likely to become dead stock.',
//       image: 'Dead Stock Analysis.png',
//       category: ['Data Analysis', 'Machine Learning'],
//       demo: '#',
//       github: 'https://github.com/AlecVOV/My-Side-Project/tree/main/Applied%20Predictive%20Analytics%20with%20Dead%20Stock'
//     },
//     {
//       title: 'Ho Chi Minh Real Estate Analysis',
//       description: 'The project investigates how apartment prices (per m²) with linear regression.',
//       image: 'Real Estate Pricing Analysis.png',
//       category: ['Data Cleaning', 'Data Visualization', 'Machine Learning'],
//       demo: '#',
//       github: 'https://github.com/AlecVOV/My-Side-Project/tree/main/Ho%20Chi%20Minh%20Real%20Estate%20Analysis'
//     },
//     {
//       title: 'EcoCharge Solutions Analysis Dashboard',
//       description: 'A Dasbroad about EcoCharge to discover pattern about green energy.',
//       image: 'EcoCharge Solutions.png',
//       category: ['Data Visualization'],
//       demo: '#',
//       github: 'https://github.com/AlecVOV/My-Side-Project/tree/main/EcoCharge%20Solutions%20Analysis%20Dashboard'
//     },
//   ]

//   return {
//     fields,
//     education,
//     experience,
//     skills,
//     certifications,
//     projects,
//   }
// }
