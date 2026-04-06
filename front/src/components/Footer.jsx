import React from 'react'

const Footer = () => {
  return (
    <div className="footer">
      <div className="footer-flex-container">
        <div className="footer-flex-box">
          <div className="footer-avatar">
            <img src="/avatar.jpg" alt="Єник Назарій" />
          </div>
          <div className="footer-contacts">
            <div className="footer-contact-title">З питань консультації та придбання:</div>
            <div className="footer-contact-title">Єник Назарій</div>
            <div className="footer-contact-box">
              <div className="footer-contact-title">Телефон:</div>
              <a href="tel:+380674457516">0 (67) 445 75 16</a>
            </div>
            <div className="footer-contact-box">
              <div className="footer-contact-title">Месенджери:</div>
              <div className="mess-container">
                <a href="viber://add?number=380674457516"><img src="/viber.png" alt="Viber" /></a>
                <a href="https://wa.me/380674457516"><img src="/whatsapp.png" alt="WhatsApp" /></a>
                <a href="https://t.me/nazar_porsche"><img src="/tg.png" alt="Telegram" /></a>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-flex-box flex-col footer-logo-box">
          <div className="footer-logo">
            <img src="/porsche.png" alt="Porsche" />
          </div>
          <div className="footer-logo-title">PORSCHE</div>
        </div>
        <div className="footer-flex-box flex-col">
          <div className="footer-soc-title">Наші соцмережі:</div>
          <div className="soc-container">
            <a rel="noreferrer" target="_blank" href="https://www.instagram.com/porsche_system_2"><img src="/insta.png" alt="Instagram" /></a>
            <a rel="noreferrer" target="_blank" href="https://youtube.com/@porschecar7689?si=zjGLGLA_FhcH-Dp6"><img src="/you.png" alt="YouTube" /></a>
            <a rel="noreferrer" target="_blank" href="https://www.tiktok.com/@porsche_system?_t=8l8DC3QPSuE&_r=1"><img src="/tik.png" className="tiktok" alt="TikTok" /></a>
            <a rel="noreferrer" target="_blank" href="https://auto.ria.com/uk/newauto/autosalons/dnepr-dnepropetrovsk/porshe-czentr-dnipro/1163/"><img src="/autoria.png" alt="AutoRia" /></a>
          </div>
        </div>
      </div>
      <div className="footer-bottom-title">PORSCHE</div>
    </div>
  )
}

export default Footer
