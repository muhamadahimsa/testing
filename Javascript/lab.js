import { awards } from "./data.js";

document.addEventListener("DOMContentLoaded", () => {
  const lenis = new Lenis({
    autoRaf: true,
  });

  const awardsListContainer = document.querySelector(".awards-list");
  const awardPreview = document.querySelector(".award-preview");

  const POSITIONS = {
    BOTTOM: 0,
    MIDDLE: -102,
    TOP: -204,
  };

  let lastMousePosition = { x: 0, y: 0 };
  let activeAward = null;
  let ticking = false;
  let mouseTimeout = null;
  let isMouseMoving = false;

  awards.forEach((award) => {
    const awardElement = document.createElement("div");
    awardElement.className = "award";

    awardElement.innerHTML = `
      <a href="${award.link}" class= "award-wrapper">
        <div class="award-name">
          <div class="award-name-wrapper">
            <h2>${award.name}</h2>
            <h2>${award.year}</h2>
          </div>
          <h2 class="type">${award.type}</h2>
        </div>
        <div class="award-project">
          <h2>${award.project}</h2>
          <h2>${award.label}</h2>
        </div>
        <div class="award-name">
          <div class="award-name-wrapper">
            <h2>${award.name}</h2>
            <h2>${award.year}</h2>
          </div>
          <h2 class="type">${award.type}</h2>
        </div>
      </a>
    `;

    awardsListContainer.appendChild(awardElement);
  });

  const awardsElements = document.querySelectorAll(".award");

  const animatePreview = () => {
    const awardsListRect = awardsListContainer.getBoundingClientRect();
    if (
      lastMousePosition.x < awardsListRect.left ||
      lastMousePosition.x > awardsListRect.right ||
      lastMousePosition.y < awardsListRect.top ||
      lastMousePosition.y > awardsListRect.bottom
    ) {
      const previewImages = awardPreview.querySelectorAll("img");
      previewImages.forEach((img) => {
        gsap.to(img, {
          scale: 0,
          duration: 0.4,
          ease: "power2.out",
          onComplete: () => img.remove(),
        });
      });
    }
  };

  const updateAwards = () => {
    animatePreview();

    if (activeAward) {
      const rect = activeAward.getBoundingClientRect();
      const isStillOver =
        lastMousePosition.x >= rect.left &&
        lastMousePosition.x <= rect.right &&
        lastMousePosition.y >= rect.top &&
        lastMousePosition.y <= rect.bottom;

      if (!isStillOver) {
        const wrapper = activeAward.querySelector(".award-wrapper");
        const leavingFromTop = lastMousePosition.y < rect.top + rect.height / 2;

        gsap.to(wrapper, {
          y: leavingFromTop ? POSITIONS.TOP : POSITIONS.BOTTOM,
          duration: 0.4,
          ease: "power2.out",
        });
        activeAward = null;
      }
    }

    awardsElements.forEach((award, index) => {
      if (award === activeAward) return;

      const rect = award.getBoundingClientRect();
      const isMouseOver =
        lastMousePosition.x >= rect.left &&
        lastMousePosition.x <= rect.right &&
        lastMousePosition.y >= rect.top &&
        lastMousePosition.y <= rect.bottom;

      if (isMouseOver) {
        const wrapper = award.querySelector(".award-wrapper");
        const enterFromTop = lastMousePosition.y < rect.top + rect.height / 2;

        gsap.to(wrapper, {
          y: POSITIONS.MIDDLE,
          duration: 0.4,
          ease: "power2.out",
        });
        activeAward = award;
      }
    });

    ticking = false;
  };

  document.addEventListener("mousemove", (e) => {
    lastMousePosition.x = e.clientX;
    lastMousePosition.y = e.clientY;

    isMouseMoving = true;
    if (mouseTimeout) {
      clearTimeout(mouseTimeout);
    }

    const awardsListRect = awardsListContainer.getBoundingClientRect();
    const isInsideAwardsList =
      lastMousePosition.x >= awardsListRect.left &&
      lastMousePosition.x <= awardsListRect.right &&
      lastMousePosition.y >= awardsListRect.top &&
      lastMousePosition.y <= awardsListRect.bottom;

    if (isInsideAwardsList) {
      mouseTimeout = setTimeout(() => {
        isMouseMoving = false;
        const images = awardPreview.querySelectorAll("img");
        if (images.length > 1) {
          const lastImage = images[images.length - 1];
          images.forEach((img) => {
            if (img !== lastImage) {
              gsap.to(img, {
                scale: 0,
                duration: 0.4,
                ease: "power2.out",
                onComplete: () => img.remove(),
              });
            }
          });
        }
      }, 2000);
    }

    animatePreview();
  });

  document.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateAwards();
        });
        ticking = true;
      }
    },
    { passive: true }
  );

  awardsElements.forEach((award, index) => {
    const wrapper = award.querySelector(".award-wrapper");
    let currentPosition = POSITIONS.TOP;

    award.addEventListener("mouseenter", (e) => {
      activeAward = award;
      const rect = award.getBoundingClientRect();
      const enterFromTop = e.clientY < rect.top + rect.height / 2;

      if (enterFromTop || currentPosition === POSITIONS.BOTTOM) {
        currentPosition = POSITIONS.MIDDLE;
        gsap.to(wrapper, {
          y: POSITIONS.MIDDLE,
          duration: 0.4,
          ease: "power2.out",
        });
      }

      const img = document.createElement("img");
      img.src = `./Asset/Images/${index + 1}.png`;
      img.style.position = "absolute";
      img.style.top = 0;
      img.style.left = 0;
      img.style.scale = 0;
      img.style.zIndex = Date.now();

      awardPreview.appendChild(img);

      gsap.to(img, {
        scale: 1,
        duration: 0.4,
        ease: "power2.out",
      });
    });

    award.addEventListener("mouseleave", (e) => {
      activeAward = null;
      const rect = award.getBoundingClientRect();
      const leavingFromTop = e.clientY < rect.top + rect.height / 2;

      currentPosition = leavingFromTop ? POSITIONS.TOP : POSITIONS.BOTTOM;
      gsap.to(wrapper, {
        y: currentPosition,
        duration: 0.4,
        ease: "power2.out",
      });
    });
  });

  function disableTouchScroll(e) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }
});

// Nav
const nav = document.querySelector(".nav-wrapper");
const navLinks = document.querySelectorAll(".nav-links");
const isMobile = window.innerWidth < 530;

document.addEventListener("DOMContentLoaded", function () {
  const nav = document.querySelector(".nav-wrapper");
  const navMenu = document.querySelector(".nav-button");
  const navTop = document.querySelector(".nav-top");
  const navPage = document.querySelectorAll(".nav-page .ofh p");
  const navLink = document.querySelectorAll(".nav-links .ofh p");
  const icon = document.querySelector(".hamburger i");
  const navDisplay = document.querySelector(".nav-display");

  let isOpen = false;

  gsap.set(nav, { height: "3rem" });
  gsap.set(navTop, { display: "none" });
  gsap.set(navPage, { y: "150%" });
  gsap.set(navLink, { y: "150%" });

  nav.addEventListener("click", function () {
    if (isOpen) {
      !isMobile
        ? gsap.to(nav, {
            height: "34.5rem",
            // delay: 0.5,
            duration: 0.75,
            ease: "power4.inOut",
            immediateRender: false,
          })
        : gsap.to(nav, {
            height: "27.5rem",
            // delay: 0.5,
            duration: 0.75,
            ease: "power4.inOut",
            immediateRender: false,
          });

      gsap.to(navTop, {
        duration: 0.1,
        onStart: function () {
          gsap.set(navTop, { display: "flex" });
        },
        delay: 0.5,
        immediateRender: false,
      });

      gsap.to(navPage, {
        y: "0%",
        duration: 1,
        ease: "power4.out",
        stagger: 0.075,
        delay: 0.6,
        immediateRender: false,
      });

      gsap.to(navLink, {
        y: "0%",
        duration: 1,
        ease: "power4.out",
        stagger: 0.075,
        delay: 0.6,
        immediateRender: false,
      });

      gsap.to(navMenu, {
        duration: 0.5,
        ease: "power4.inOut",
        delay: 0,
        immediateRender: false,
        onComplete: function () {
          icon.className = "ph-light ph-x";
        },
      });

      gsap.to(".nav-button-wrapper span:nth-child(1)", {
        top: "100%",
        ease: "power4.inOut",
        duration: 0.75,
        delay: 0.3,
      });

      gsap.to(".nav-button-wrapper span:nth-child(2)", {
        top: "0%",
        ease: "power4.inOut",
        duration: 0.75,
        delay: 0.3,
      });
    } else {
      gsap.to(nav, {
        height: "3rem",
        duration: 1,
        ease: "power4.inOut",
        delay: 0.2,
        immediateRender: false,
      });

      gsap.to(navTop, {
        duration: 0.1,
        onComplete: function () {
          gsap.set(navTop, { display: "none" });
        },
        delay: 1,
        immediateRender: false,
      });

      gsap.to(navPage, {
        y: "150%",
        duration: 1,
        ease: "power4.out",
        stagger: 0.075,
        immediateRender: false,
      });

      gsap.to(navLink, {
        y: "150%",
        duration: 1,
        ease: "power4.out",
        stagger: 0.075,
        immediateRender: false,
      });

      gsap.to(navMenu, {
        duration: 0.2,
        ease: "power4.inOut",
        immediateRender: false,
        onComplete: function () {
          icon.className = "ph-light ph-list";
        },
      });

      gsap.to(".nav-button-wrapper span:nth-child(1)", {
        top: "0%",
        ease: "power4.inOut",
        duration: 0.75,
        delay: 0.3,
      });

      gsap.to(".nav-button-wrapper span:nth-child(2)", {
        top: "100%",
        ease: "power4.inOut",
        duration: 0.75,
        delay: 0.3,
      });
    }
    isOpen = !isOpen;
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const linkItems = document.querySelectorAll(".nav-page");

  linkItems.forEach((item) => {
    const copyElements = item.querySelectorAll(".ofh");

    copyElements.forEach((a) => {
      const copy = a.querySelector("p");

      if (copy) {
        const duplicateCopy = document.createElement("p");
        duplicateCopy.textContent = copy.textContent;
        a.appendChild(duplicateCopy);
      }
    });
  });

  document.querySelectorAll(".nav-page").forEach((item) => {
    item.addEventListener("mouseover", () => {
      mouseOverAnimation(item);
    });

    item.addEventListener("mouseout", () => {
      mouseOutAnimation(item);
    });
  });

  const mouseOverAnimation = (elem) => {
    gsap.to(elem.querySelectorAll("p:nth-child(1)"), {
      top: "-100%",
      duration: 0.3,
    });
    gsap.to(elem.querySelectorAll("p:nth-child(2)"), {
      top: "0%",
      duration: 0.3,
    });
  };

  const mouseOutAnimation = (elem) => {
    gsap.to(elem.querySelectorAll("p:nth-child(1)"), {
      top: "0%",
      duration: 0.3,
    });
    gsap.to(elem.querySelectorAll("p:nth-child(2)"), {
      top: "100%",
      duration: 0.3,
    });
  };
});
