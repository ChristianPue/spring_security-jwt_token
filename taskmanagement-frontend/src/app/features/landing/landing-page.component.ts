import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent, FooterComponent],
  template: `
    <app-navbar>
      <button class="menu-btn" routerLink="/auth/login">Iniciar Sesión</button>
      <button class="cta-btn" routerLink="/auth/register">Registrarse</button>
    </app-navbar>
    <div class="landing-hero">
      <div class="hero-content">
        <h1>Organiza tu equipo y tus tareas<br><span class="highlight">de forma simple y eficiente</span></h1>
        <p class="hero-sub">La plataforma ideal para gestionar proyectos, tareas y desarrolladores en un solo lugar.</p>
        <button class="cta-btn" routerLink="/auth/login">Comenzar ahora</button>
      </div>
      <div class="hero-image">
        <img src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80" alt="Gestión de tareas" />
      </div>
    </div>

    <div class="landing-testimonial" id="testimonio">
      <div class="testimonial-slider">
        <button class="testimonial-arrow left" (click)="prevTestimonial()">&#8592;</button>
        <div class="testimonial-horizontal">
          <img class="testimonial-avatar" [src]="testimonials[currentTestimonial].avatar" [alt]="testimonials[currentTestimonial].author" />
          <div class="testimonial-content">
            <blockquote>
              {{ testimonials[currentTestimonial].text }}
            </blockquote>
            <div class="testimonial-author">
              {{ testimonials[currentTestimonial].author }}<br><span>{{ testimonials[currentTestimonial].role }}</span>
            </div>
          </div>
        </div>
        <button class="testimonial-arrow right" (click)="nextTestimonial()">&#8594;</button>
      </div>
    </div>

    <div class="landing-about" id="sobre-nosotros">
      <div class="about-content">
        <div class="about-text">
          <h2>Sobre Nosotros</h2>
          <p>TaskManager nace con la misión de simplificar la gestión de proyectos y equipos para empresas y desarrolladores de todo el mundo.</p>
          <p>Creemos en la tecnología como motor de productividad y colaboración, y trabajamos cada día para ofrecerte la mejor experiencia.</p>
        </div>
        <div class="about-illustration">
          <img src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=400&q=80" alt="Equipo colaborando" />
        </div>
      </div>
    </div>

    <div class="landing-team" id="equipo">
      <h2>Creador</h2>
      <div class="team-horizontal">
        <img src="/assets/hampcode.jpeg" alt="Foto de HampCode" class="foto-creador" />
        <div class="team-info-horizontal">
          <div class="team-name">Henry Antonio Mendoza Puerta <span class="nickname">(HampCode)</span></div>
          <div class="team-role">Desarrollador Full Stack & Founder</div>
          <p>Apasionado por la tecnología, la innovación y el desarrollo de soluciones que impactan positivamente en las personas y equipos. Docente universitario y creador de contenido en <a href='https://github.com/hampcode' target='_blank' class="plain-link">GitHub</a>.</p>
        </div>
      </div>
    </div>

    <div class="landing-benefits">
      <div class="benefit">
        <span class="benefit-icon">📋</span>
        <h3>Gestión de Tareas</h3>
        <p>Crea, asigna y controla el avance de tus tareas fácilmente.</p>
      </div>
      <div class="benefit">
        <span class="benefit-icon">👥</span>
        <h3>Colaboración en Equipo</h3>
        <p>Asigna tareas a desarrolladores y mantén a todos sincronizados.</p>
      </div>
      <div class="benefit">
        <span class="benefit-icon">📈</span>
        <h3>Seguimiento Visual</h3>
        <p>Visualiza el progreso y el estado de cada proyecto en tiempo real.</p>
      </div>
    </div>
    <div class="landing-how">
      <h2>¿Cómo funciona?</h2>
      <div class="how-steps">
        <div class="how-step">
          <span class="step-number">1</span>
          <p>Regístrate y crea tu cuenta</p>
        </div>
        <div class="how-step">
          <span class="step-number">2</span>
          <p>Crea tareas y asígnalas a tu equipo</p>
        </div>
        <div class="how-step">
          <span class="step-number">3</span>
          <p>Haz seguimiento y completa tus proyectos</p>
        </div>
      </div>
    </div>
    <div class="landing-quote">
      <blockquote>
        "La organización es la clave del éxito en cualquier equipo. ¡Empieza hoy a trabajar mejor!"
      </blockquote>
    </div>
    <div class="landing-cta-final">
      <button class="cta-btn cta-action" routerLink="/auth/register">¡Regístrate ahora!</button>
    </div>
    <app-footer></app-footer>
  `,
  styleUrls: ['./landing-page.component.css']
})
export class LandingPageComponent {
  testimonials = [
    {
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      author: 'María López',
      role: 'Project Manager',
      text: 'TaskManager ha transformado la forma en que nuestro equipo colabora y gestiona proyectos. ¡Ahora todo es más simple y eficiente!'
    },
    {
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      author: 'Carlos Pérez',
      role: 'Desarrollador Backend',
      text: 'La facilidad de uso y la integración con nuestro flujo de trabajo es insuperable. ¡Muy recomendable!'
    },
    {
      avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
      author: 'Ana Torres',
      role: 'Scrum Master',
      text: 'Gracias a TaskManager, la comunicación y el seguimiento de tareas en el equipo es mucho más claro y eficiente.'
    }
  ];
  currentTestimonial = 0;

  prevTestimonial() {
    this.currentTestimonial = (this.currentTestimonial - 1 + this.testimonials.length) % this.testimonials.length;
  }
  nextTestimonial() {
    this.currentTestimonial = (this.currentTestimonial + 1) % this.testimonials.length;
  }
} 