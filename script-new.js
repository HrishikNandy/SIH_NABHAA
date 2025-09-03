document.addEventListener('DOMContentLoaded', () => {
  // Mobile Navigation
  const burger = document.querySelector('.burger');
  const nav = document.querySelector('.nav-links');
  const navItems = document.querySelectorAll('.nav-links li');

  if (burger && nav) {
    burger.addEventListener('click', () => {
      nav.classList.toggle('active');
      navItems.forEach((li, i) => {
        li.style.animation = li.style.animation ? '' : `navLinkFade 0.5s ease forwards ${i / 7 + 0.3}s`;
      });
      burger.classList.toggle('toggle');
    });

    // close after click
    navItems.forEach((li) => li.addEventListener('click', () => {
      if (nav.classList.contains('active')) {
        nav.classList.remove('active');
        burger.classList.remove('toggle');
        navItems.forEach(item => (item.style.animation = ''));
      }
    }));
  }

  // Contact form
  const contactForm = document.getElementById('contact-form');
  const formMessage = document.getElementById('form-message');
  if (contactForm && formMessage) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('name')?.value || '';
      const email = document.getElementById('email')?.value || '';
      if (!name.trim() || !email.trim()) {
        formMessage.textContent = 'Please fill in all required fields.';
        formMessage.style.color = 'red';
      } else {
        formMessage.textContent = `Thank you, ${name}! Your message has been received.`;
        formMessage.style.color = '#3b82f6';
        contactForm.reset();
      }
    });
  }
});
// ---- Scroll reveal (no HTML changes required) ----
(() => {
  // add .reveal to common elements
  const autoTargets = document.querySelectorAll(
    '.hero-content, section h2, .feature-card, .course-card, #about p, #contact form'
  );
  autoTargets.forEach(el => el.classList.add('reveal'));

  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
})();
// ---- Scroll progress bar ----
window.addEventListener('scroll', () => {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
  const scrolled = (scrollTop / (scrollHeight - clientHeight)) * 100;
  const bar = document.getElementById('progress-bar');
  if (bar) bar.style.width = scrolled + "%";
});
// ---- Dark mode toggle ----
const toggleBtn = document.getElementById('dark-toggle');
if (toggleBtn) {
  // load saved mode
  if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark');
  }

  toggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    if (document.body.classList.contains('dark')) {
      localStorage.setItem('darkMode', 'enabled');
      toggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
      localStorage.setItem('darkMode', 'disabled');
      toggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
    }
  });
}
// ---- Animated Counters ----
const counters = document.querySelectorAll('.num');
const speed = 180; // smaller = faster

const animateCounters = () => {
  counters.forEach(counter => {
    const target = +counter.getAttribute('data-target');
    const update = () => {
      const current = +counter.innerText;
      const increment = Math.ceil(target / speed);
      if (current < target) {
        counter.innerText = current + increment;
        setTimeout(update, 20);
      } else {
        counter.innerText = target;
      }
    };
    update();
  });
};

// Trigger when Impact section is visible
const impactSection = document.getElementById('impact');
if (impactSection) {
  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      animateCounters();
      observer.unobserve(impactSection); // run once
    }
  }, { threshold: 0.3 });
  observer.observe(impactSection);
}
// ---- Course Filters ----
(() => {
  const filterBar = document.querySelector('.course-filters');
  if (!filterBar) return; // run only on courses page

  const buttons = filterBar.querySelectorAll('.filter-btn');
  const blocks  = document.querySelectorAll('.category-block');

  const showCategory = (key) => {
    blocks.forEach(b => {
      const cat = b.getAttribute('data-category');
      if (key === 'all' || key === cat) {
        b.classList.remove('hidden');
      } else {
        b.classList.add('hidden');
      }
    });
  };

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      // update active state
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // filter categories
      const key = btn.getAttribute('data-filter');
      showCategory(key);
    });
  });
})();
// ---- Course Detail Modals (with action buttons) ----
(() => {
  const modal = document.getElementById('course-modal');
  if (!modal) return; // only run on courses page

  const modalTitle = document.getElementById('modal-title');
  const modalDesc  = document.getElementById('modal-desc');
  const modalExtra = document.getElementById('modal-extra');
  const closeBtn   = modal.querySelector('.close-btn');

  // Full details for all 12 courses
  const courseDetails = {
    // Digital Literacy
    "Basic Computer Skills": {
      desc: "Learn keyboard & mouse basics, typing practice, file/folder handling, and simple settings.",
      extra: [
        "Duration: 2 weeks",
        "Includes: Practice exercises, offline notes, printable worksheets",
        "Outcome: Operate a computer confidently"
      ]
    },
    "Safe Internet Use": {
      desc: "Cyber safety essentials: strong passwords, phishing awareness, privacy settings, and responsible browsing.",
      extra: [
        "Duration: 1 week",
        "Includes: Safety guides, short videos, quick quizzes",
        "Outcome: Safer digital habits"
      ]
    },
    "MS Office Basics": {
      desc: "A friendly intro to Word, Excel, and PowerPoint for schoolwork and simple projects.",
      extra: [
        "Duration: 3 weeks",
        "Includes: Step-by-step PDFs, demo files, practice tasks",
        "Outcome: Create basic documents, sheets, and slides"
      ]
    },

    // Languages
    "Punjabi Language": {
      desc: "Punjabi grammar, vocabulary, reading comprehension, and storytelling with local examples.",
      extra: [
        "Duration: 4 weeks",
        "Includes: Audio lessons, worksheets, reading passages",
        "Outcome: Better fluency & comprehension in Punjabi"
      ]
    },
    "Hindi Language": {
      desc: "Core Hindi skills: varnmala, grammar basics, reading, writing, and speaking practice.",
      extra: [
        "Duration: 4 weeks",
        "Includes: Practice sheets, dictation audios, activities",
        "Outcome: Improved reading/writing confidence"
      ]
    },
    "English Language Skills": {
      desc: "Basic grammar, everyday conversation, vocabulary building, and simple paragraph writing.",
      extra: [
        "Duration: 4 weeks",
        "Includes: Flashcards, dialogues, speaking prompts",
        "Outcome: Simple everyday English communication"
      ]
    },

    // STEM Subjects
    "Interactive Mathematics": {
      desc: "Foundational math through activities: numbers, operations, word problems, mental math.",
      extra: [
        "Duration: 4 weeks",
        "Includes: Practice sets, timed quizzes, answer keys",
        "Outcome: Faster calculation & problem-solving"
      ]
    },
    "Science & Technology": {
      desc: "Concepts made simple: forces, energy, plants & animals, basic machines, with everyday experiments.",
      extra: [
        "Duration: 4 weeks",
        "Includes: DIY experiments, short videos, worksheets",
        "Outcome: Curiosity & real-world understanding"
      ]
    },
    "Environmental Studies": {
      desc: "Our environment, resources, waste management, and local sustainability actions.",
      extra: [
        "Duration: 3 weeks",
        "Includes: Field tasks, charts, case studies",
        "Outcome: Awareness & eco-friendly habits"
      ]
    },

    // Life Skills
    "General Knowledge": {
      desc: "India & world basics, states & capitals, symbols, current affairs for school quizzes.",
      extra: [
        "Duration: Ongoing",
        "Includes: Weekly updates, MCQs, printable sheets",
        "Outcome: Better GK & quiz readiness"
      ]
    },
    "Financial Literacy": {
      desc: "Money basics, saving vs spending, UPI/ATM safety, bank accounts explained simply.",
      extra: [
        "Duration: 2 weeks",
        "Includes: Real-life activities, budgeting template",
        "Outcome: Smart money habits"
      ]
    },
    "Digital Career Skills": {
      desc: "Create an email, attach files, fill online forms, basic resume; intro to online safety at work.",
      extra: [
        "Duration: 2 weeks",
        "Includes: Resume template, sample forms, checklists",
        "Outcome: Job/college application readiness"
      ]
    },
"Teacher Support": {
  desc: "Dedicated training modules for teachers, covering platform usage, lesson planning with digital tools, and best practices.",
  extra: [
    "Duration: 2 weeks",
    "Includes: Teacher guidebook, video walkthroughs, support forum access",
    "Outcome: Confident use of Nabha Digital Shiksha tools in classrooms"
  ]
}
};

  // Make safe file names for syllabus PDFs, from course titles
  const toFileName = (title) =>
    title.replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "_") + ".pdf"; // e.g., "Basic_Computer_Skills.pdf"

  // Click handler for every course card
  document.querySelectorAll('.course-card').forEach(card => {
    card.addEventListener('click', () => {
      const title = card.querySelector('h3').textContent.trim();
      modalTitle.textContent = title;

      // Fill description & bullet list
      if (courseDetails[title]) {
        modalDesc.textContent = courseDetails[title].desc;
        modalExtra.innerHTML = courseDetails[title].extra
          .map(e => `<li>${e}</li>`)
          .join('');
      } else {
        // fallback if a new card isn't mapped yet
        modalDesc.textContent = card.querySelector('p')?.textContent || "Course details coming soon.";
        modalExtra.innerHTML = "<li>Duration: Coming soon</li><li>Includes: Coming soon</li>";
      }

      // Remove older action bar (if modal reopened)
      const oldActions = modal.querySelector('.modal-actions');
      if (oldActions) oldActions.remove();

      // Build action buttons container
      const actions = document.createElement('div');
      actions.className = 'modal-actions';

      // Start Course (blue)
      const startBtn = document.createElement('a');
      startBtn.className = 'start-btn';
      startBtn.textContent = 'Start Course';
      startBtn.href = '#'; // later: link to a real course page
      startBtn.addEventListener('click', (e) => {
        e.preventDefault();
        modal.style.display = 'none';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });

      // Download Syllabus (PDF)
      const syllabusBtn = document.createElement('a');
      syllabusBtn.className = 'syllabus-btn';
      syllabusBtn.textContent = 'Download Syllabus';
      syllabusBtn.href = 'syllabus/' + toFileName(title); // e.g., syllabus/Basic_Computer_Skills.pdf
      syllabusBtn.setAttribute('download', '');

      actions.appendChild(startBtn);
      actions.appendChild(syllabusBtn);

      // Insert buttons right after the bullet list
      modalExtra.insertAdjacentElement('afterend', actions);

      // Show modal
      modal.style.display = 'flex';
    });
  });

  // Close modal
  closeBtn.addEventListener('click', () => { modal.style.display = 'none'; });
  window.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
  });
})();
