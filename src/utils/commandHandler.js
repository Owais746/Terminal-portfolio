import { personalInfo, about, skills, projects, services, experience, stats } from '../data/portfolioData';
import cvPdf from '../data/Muhammad_Owais_CV_Final.pdf';

export const processCommand = (input) => {
  const command = input.trim().toLowerCase();
  const args = command.split(' ');
  const mainCommand = args[0];

  switch (mainCommand) {
    case 'help':
      return {
        type: 'help',
        content: `
Available Commands:
------------------
  <span class="text-terminal-cyan">help</span>           - Show this help message
  <span class="text-terminal-cyan">about</span>          - Learn about me
  <span class="text-terminal-cyan">skills</span>         - View my technical skills
  <span class="text-terminal-cyan">skills --list</span>  - List all skills with levels
  <span class="text-terminal-cyan">projects</span>       - View my portfolio projects
  <span class="text-terminal-cyan">projects [num]</span> - View specific project details
  <span class="text-terminal-cyan">experience</span>     - View my work experience
  <span class="text-terminal-cyan">services</span>       - See what services I offer
  <span class="text-terminal-cyan">contact</span>        - Get my contact information
  <span class="text-terminal-cyan">social</span>         - View my social media links
  <span class="text-terminal-cyan">stats</span>          - View my statistics
  <span class="text-terminal-cyan">clear</span>          - Clear the terminal
  <span class="text-terminal-cyan">resume</span>         - View my resume
  <span class="text-terminal-cyan">whoami</span>         - Display current user info
  <span class="text-terminal-cyan">date</span>           - Show current date and time
  <span class="text-terminal-cyan">banner</span>         - Show ASCII banner again
  <span class="text-terminal-cyan">theme</span>          - Change terminal theme
        `
      };

    case 'about':
      return {
        type: 'about',
        content: `
<span class="text-terminal-cyan font-bold text-xl">About Me</span>
${'-'.repeat(60)}

<span class="text-terminal-yellow">${personalInfo.name}</span>
<span class="text-terminal-text">${personalInfo.role}</span>

${about.tagline}

${about.description.map(para => `  ${para}`).join('\n\n')}

<span class="text-terminal-cyan">Location:</span> ${personalInfo.city}
<span class="text-terminal-cyan">Age:</span> ${personalInfo.age}
<span class="text-terminal-cyan">Education:</span> ${personalInfo.degree}
<span class="text-terminal-cyan">Freelance:</span> ${personalInfo.freelance}
        `
      };

    case 'skills':
      if (args[1] === '--list') {
        return {
          type: 'skills',
          content: `
<span class="text-terminal-cyan font-bold text-xl">Technical Skills</span>
${'-'.repeat(60)}

${skills.map(skill => {
  const bar = '█'.repeat(Math.floor(parseInt(skill.level) / 5)) + '░'.repeat(20 - Math.floor(parseInt(skill.level) / 5));
  return `<span class="text-terminal-yellow">${skill.name.padEnd(20)}</span> [${bar}] ${skill.level}`;
}).join('\n')}
          `
        };
      }
      return {
        type: 'skills',
        content: `
<span class="text-terminal-cyan font-bold text-xl">Technical Skills</span>
${'-'.repeat(60)}

${skills.map(skill => `  • ${skill.name} (${skill.level})`).join('\n')}

<span class="text-gray-500">Tip: Use 'skills --list' for a detailed view</span>
        `
      };

    case 'projects':
      if (args[1] && !isNaN(args[1])) {
        const projectIndex = parseInt(args[1]) - 1;
        if (projectIndex >= 0 && projectIndex < projects.length) {
          const project = projects[projectIndex];
          return {
            type: 'project-detail',
            content: `
<span class="text-terminal-cyan font-bold text-xl">${project.title}</span>
${'-'.repeat(60)}

<span class="text-terminal-yellow">Description:</span>
  ${project.description}

<span class="text-terminal-yellow">Technologies:</span>
  ${project.tech.join(', ')}

<span class="text-terminal-yellow">Live URL:</span>
  <a href="${project.url}" target="_blank" class="text-terminal-blue underline hover:text-terminal-cyan">${project.url}</a>
            `
          };
        }
        return {
          type: 'error',
          content: `<span class="text-terminal-red">Error: Project #${args[1]} not found. Use 'projects' to see all projects.</span>`
        };
      }
      return {
        type: 'projects',
        content: `
<span class="text-terminal-cyan font-bold text-xl">Portfolio Projects</span>
${'-'.repeat(60)}

${projects.map((project, index) => `
<span class="text-terminal-yellow">[${index + 1}]</span> <span class="text-terminal-cyan font-bold">${project.title}</span>
    ${project.description.substring(0, 100)}${project.description.length > 100 ? '...' : ''}
    <a href="${project.url}" target="_blank" class="text-terminal-blue underline hover:text-terminal-cyan">🔗 ${project.url}</a>
`).join('\n')}

<span class="text-gray-500">Tip: Use 'projects [number]' to view details</span>
        `
      };

    case 'experience':
      return {
        type: 'experience',
        content: `
<span class="text-terminal-cyan font-bold text-xl">Work Experience</span>
${'-'.repeat(60)}

${experience.map(exp => `
<span class="text-terminal-yellow font-bold">${exp.title}</span>
<span class="text-terminal-text">${exp.period} | ${exp.location}</span>

${exp.highlights.map(h => `  ✓ ${h}`).join('\n')}
`).join('\n')}
        `
      };

    case 'services':
      return {
        type: 'services',
        content: `
<span class="text-terminal-cyan font-bold text-xl">Services I Offer</span>
${'-'.repeat(60)}

${services.map(service => `
<span class="text-terminal-yellow">▸ ${service.title}</span>
  ${service.description}
`).join('\n')}
        `
      };

    case 'contact':
      return {
        type: 'contact',
        content: `
<span class="text-terminal-cyan font-bold text-xl">Contact Information</span>
${'-'.repeat(60)}

<span class="text-terminal-yellow">Email:</span>    ${personalInfo.email}
<span class="text-terminal-yellow">Phone:</span>    ${personalInfo.phone}
<span class="text-terminal-yellow">Location:</span> ${personalInfo.city}
<span class="text-terminal-yellow">WhatsApp:</span> <a href="${personalInfo.whatsapp}" target="_blank" class="text-terminal-blue underline">Click to Chat</a>

<span class="text-gray-500">Use 'social' to see all social media links</span>
        `
      };

    case 'social':
      return {
        type: 'social',
        content: `
<span class="text-terminal-cyan font-bold text-xl">Social Media Links</span>
${'-'.repeat(60)}

<span class="text-terminal-yellow">GitHub:</span>    <a href="${personalInfo.github}" target="_blank" class="text-terminal-blue underline">${personalInfo.github}</a>
<span class="text-terminal-yellow">LinkedIn:</span>  <a href="${personalInfo.linkedin}" target="_blank" class="text-terminal-blue underline">${personalInfo.linkedin}</a>
<span class="text-terminal-yellow">Instagram:</span> <a href="${personalInfo.instagram}" target="_blank" class="text-terminal-blue underline">${personalInfo.instagram}</a>
<span class="text-terminal-yellow">Facebook:</span>  <a href="${personalInfo.facebook}" target="_blank" class="text-terminal-blue underline">${personalInfo.facebook}</a>
<span class="text-terminal-yellow">Portfolio:</span> <a href="${personalInfo.portfolio}" target="_blank" class="text-terminal-blue underline">${personalInfo.portfolio}</a>
        `
      };

    case 'stats':
      return {
        type: 'stats',
        content: `
<span class="text-terminal-cyan font-bold text-xl">Statistics</span>
${'-'.repeat(60)}

<span class="text-terminal-yellow">😊 Happy Clients:</span>        ${stats.happyClients}
<span class="text-terminal-yellow">📁 Completed Projects:</span>   ${stats.completedProjects}
<span class="text-terminal-yellow">⏰ Hours of Work:</span>        ${stats.hoursOfWork}
        `
      };

    case 'resume':
      return {
        type: 'resume',
        content: `
<span class="text-terminal-cyan font-bold text-xl">Resume</span>
${'-'.repeat(60)}

Use the following commands to explore my resume:
  â€¢ <span class="text-terminal-cyan">about</span> - Personal information
  â€¢ <span class="text-terminal-cyan">skills</span> - Technical skills
  â€¢ <span class="text-terminal-cyan">experience</span> - Work experience
  â€¢ <span class="text-terminal-cyan">projects</span> - Portfolio projects
  â€¢ <span class="text-terminal-cyan">services</span> - Services I offer

<span class="text-terminal-yellow">Download PDF Resume:</span>
<a href="${cvPdf}" download class="text-terminal-blue underline">Muhammad_Owais_Resume.pdf</a>
        `
      };

    case 'whoami':
      return {
        type: 'info',
        content: `<span class="text-terminal-yellow">visitor</span>@<span class="text-terminal-cyan">owais-portfolio</span>`
      };

    case 'date':
      return {
        type: 'info',
        content: new Date().toString()
      };

    case 'clear':
      return {
        type: 'clear',
        content: ''
      };

    case 'banner':
      return {
        type: 'banner',
        content: 'SHOW_BANNER'
      };

    case 'theme':
      return {
        type: 'theme',
        content: `
<span class="text-terminal-cyan">Available themes:</span>
  • green (default)
  • cyan
  • amber
  • blue

<span class="text-gray-500">Theme changing coming soon!</span>
        `
      };

    // Easter eggs
    case 'sudo':
      if (args.slice(1).join(' ').includes('rm -rf')) {
        return {
          type: 'easter-egg',
          content: `<span class="text-terminal-red">🛑 Nice try, hacker! 🛑</span>
Permission denied. You don't have the power here! 😎`
        };
      }
      return {
        type: 'error',
        content: `<span class="text-terminal-red">sudo: ${args.slice(1).join(' ')}: command not found</span>`
      };

    case 'hack':
      return {
        type: 'easter-egg',
        content: `
<span class="text-terminal-cyan">Initializing hack sequence...</span>
<span class="text-terminal-yellow">[████████████████████] 100%</span>
<span class="text-terminal-red">ACCESS DENIED</span>
Just kidding! But nice attempt 😄
        `
      };

    case 'ls':
      return {
        type: 'info',
        content: `about.txt  skills.json  projects.db  experience.log  contact.info  resume.pdf`
      };

    case 'pwd':
      return {
        type: 'info',
        content: '/home/owais/portfolio'
      };

    case 'echo':
      return {
        type: 'info',
        content: args.slice(1).join(' ')
      };

    case '':
      return {
        type: 'empty',
        content: ''
      };

    default:
      return {
        type: 'error',
        content: `<span class="text-terminal-red">Command not found: ${mainCommand}</span>
Type '<span class="text-terminal-cyan">help</span>' to see available commands.`
      };
  }
};
