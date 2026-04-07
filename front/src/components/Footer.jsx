import React from 'react'
import { getImageUrl } from '../axios'

const Footer = () => {
  return (
    <footer className="footer" style={{ '--footer-background-image': `url("${getImageUrl('/uploads/foot2.jpg')}")` }}>
      <div className="footer-shell">
        <div className="footer-brand-panel">
          <div className="footer-brand-copy">
            <div className="footer-overline">Персональний сайт продавця</div>
            <div className="footer-logo-mark">
              <img src="/porsche.png" alt="Porsche" />
            </div>
            <div className="footer-logo-title">PORSCHE</div>
            <div className="footer-brand-text">
              Преміальний підбір моделей, фото та консультація для клієнтів, які обирають емоцію, точність і статус.
            </div>
          </div>
          <div className="footer-brand-actions">
            <a className="footer-primary-link" href="tel:+380674457516">Зателефонувати</a>
            <a className="footer-secondary-link" href="https://wa.me/380674457516">Написати у WhatsApp</a>
          </div>
        </div>
        <div className="footer-grid">
          <div className="footer-card footer-card-contact">
            <div className="footer-avatar">
              <img src="/avatar.jpg" alt="Єник Назарій" />
            </div>
            <div className="footer-card-body">
              <div className="footer-card-label">Персональна консультація</div>
              <div className="footer-contact-title">Єник Назарій</div>
              <div className="footer-contact-text">З питань консультації, підбору та придбання.</div>
              <div className="footer-contact-box">
                <div className="footer-contact-caption">Телефон</div>
                <a href="tel:+380674457516">0 (67) 445 75 16</a>
              </div>
              <div className="footer-contact-box">
                <div className="footer-contact-caption">Месенджери</div>
                <div className="mess-container">
                  <a href="viber://add?number=380674457516"><img src="/viber.png" alt="Viber" /></a>
                  <a href="https://wa.me/380674457516"><img src="/whatsapp.png" alt="WhatsApp" /></a>
                  <a href="https://t.me/nazar_porsche"><img src="/tg.png" alt="Telegram" /></a>
                </div>
              </div>
            </div>
          </div>
          <div className="footer-card footer-card-social">
            <div className="footer-card-label">Присутність бренду</div>
            <div className="footer-soc-title">Наші соцмережі</div>
            <div className="footer-contact-text">Актуальні огляди, новини та візуальна історія Porsche Dnipro.</div>
            <div className="soc-container">
              <a rel="noreferrer" target="_blank" href="https://www.instagram.com/porsche_system_2"><img src="/insta.png" alt="Instagram" /></a>
              <a rel="noreferrer" target="_blank" href="https://youtube.com/@porschecar7689?si=zjGLGLA_FhcH-Dp6"><img src="/you.png" alt="YouTube" /></a>
              <a rel="noreferrer" target="_blank" href="https://www.tiktok.com/@porsche_system?_t=8l8DC3QPSuE&_r=1"><img src="/tik.png" className="tiktok" alt="TikTok" /></a>
              <a rel="noreferrer" target="_blank" href="https://auto.ria.com/uk/newauto/autosalons/dnepr-dnepropetrovsk/porshe-czentr-dnipro/1163/"><img src="/autoria.png" alt="AutoRia" /></a>
            </div>
          </div>
          <div className="footer-card footer-card-features">
            <div className="footer-card-label">Філософія сервісу</div>
            <div className="footer-feature-list">
              <div className="footer-feature-item">
                <span className="footer-feature-value">01</span>
                <span>Преміальний підхід до кожного запиту</span>
              </div>
              <div className="footer-feature-item">
                <span className="footer-feature-value">02</span>
                <span>Візуально насичена галерея моделей та інтерʼєрів</span>
              </div>
              <div className="footer-feature-item">
                <span className="footer-feature-value">03</span>
                <span>Швидкий зв’язок для консультації та придбання</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
