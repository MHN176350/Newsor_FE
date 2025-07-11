import React, { useEffect, useState } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_CONTACT } from '../graphql/queries';
import './EvolusoftHomePage.css';
import { useEditableText } from '../hooks/useEditableText';

const EvolusoftHomePage = () => {
  const { getText, loading: textLoading } = useEditableText();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    request_service: '',
    request_content: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isContentVisible, setIsContentVisible] = useState(true); // Always show content

  // Contact creation mutation
  const [createContact, { loading: submittingContact }] = useMutation(CREATE_CONTACT, {
    onCompleted: (data) => {
      if (data.createContact.success) {
        setMessage({ 
          type: 'success', 
          text: 'Thank you for reaching out! Your message has been received and our team will contact you shortly.' 
        });
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          request_service: '',
          request_content: ''
        });
      } else {
        setMessage({ 
          type: 'error', 
          text: data.createContact.errors?.join(', ') || 'We apologize, but there was an issue processing your request. Please try again or contact us directly.' 
        });
      }
      setIsLoading(false);
    },
    onError: (error) => {
      setMessage({ 
        type: 'error', 
        text: 'We\'re experiencing technical difficulties. Please try again in a moment or contact us directly for immediate assistance.' 
      });
      setIsLoading(false);
    }
  });

  useEffect(() => {
    // Add body class for styling
    document.body.classList.add('index-page');
    
    // Load EvoluSoft CSS files
    const loadCSS = (href, id) => {
      if (!document.getElementById(id)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.id = id;
        document.head.appendChild(link);
      }
    };

    // Load all required CSS files
    loadCSS('/evolusoft/assets/vendor/bootstrap/css/bootstrap.min.css', 'bootstrap-css');
    loadCSS('/evolusoft/assets/vendor/bootstrap-icons/bootstrap-icons.css', 'bootstrap-icons-css');
    loadCSS('/evolusoft/assets/vendor/aos/aos.css', 'aos-css');
    loadCSS('/evolusoft/assets/css/main.css', 'evolusoft-main-css');
    
    // Load JavaScript files for functionality
    const loadScript = (src, id) => {
      return new Promise((resolve, reject) => {
        if (document.getElementById(id)) {
          resolve();
          return;
        }
        
        const script = document.createElement('script');
        script.src = src;
        script.id = id;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
        document.head.appendChild(script);
      });
    };

    // Load required scripts
    const loadScripts = async () => {
      try {
        await loadScript('/evolusoft/assets/vendor/bootstrap/js/bootstrap.bundle.min.js', 'bootstrap-js');
        await loadScript('/evolusoft/assets/vendor/aos/aos.js', 'aos-js');
        await loadScript('/evolusoft/assets/js/main.js', 'evolusoft-main-js');
        
        // Initialize AOS if available
        if (window.AOS) {
          window.AOS.init();
        }
      } catch (error) {
        // Silently handle script loading failures to avoid affecting user experience
      }
    };

    loadScripts();
    
    return () => {
      document.body.classList.remove('index-page');
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Validate required fields
      if (!formData.name || !formData.email || !formData.request_service || !formData.request_content) {
        setMessage({ 
          type: 'error', 
          text: 'Please complete all required fields to submit your request.' 
        });
        setIsLoading(false);
        return;
      }

      // Submit contact form via GraphQL
      await createContact({
        variables: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          requestService: formData.request_service,
          requestContent: formData.request_content
        }
      });
      
      // Success handling is done in the mutation's onCompleted callback
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'We\'re experiencing technical difficulties. Please try again in a moment or contact us directly for immediate assistance.' 
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="evolusoft-page">
      {/* Header */}
      <header id="header" className="header d-flex align-items-center fixed-top">
        <div className="container position-relative d-flex align-items-center justify-content-between">
          <a href="#hero" className="logo d-flex align-items-center me-auto me-xl-0">
            <h1 className="sitename">
              <img src="/evolusoft/assets/img/company_name.png" alt="EvoluSoft" />
            </h1>
          </a>
          
          <nav id="navmenu" className="navmenu">
            <ul>
              <li><a href="#hero" className="active">Home</a></li>
              <li><a href="#about">About us</a></li>
              <li><a href="#products">Products</a></li>
              <li><a href="#services">Services</a></li>
              <li><a href="#contact">Contact</a></li>
              <li><a href="/news">All News</a></li>
            </ul>
            <i className="mobile-nav-toggle d-xl-none bi bi-list"></i>
          </nav>

          <a className="btn-getstarted" href="#about">Get started</a>
        </div>
      </header>

      {/* Main Content */}
      <main className="main">
        {/* Hero Section */}
        <section id="hero" className="hero section">
          <div className="container" data-aos="fade-up" data-aos-delay="100">
            <div className="row align-items-center mb-5">
              <div className="col-lg-6 mb-4 mb-lg-0">
                <h1 className="hero-title mb-4" style={{ fontFamily: 'Canela' }}>
                  {getText('pageSlogan', 'Innovate together, Succeed Together')} {/*Can change (Page slogan)*/}
                </h1>
                <p className="hero-description mb-4" style={{ textAlign: 'justify' }}>
                  {getText('pageShortDescription', 'EvoluSoft harnesses cutting-edge technology, collaborating globally with clients to deliver transformative solutions, drive success, and celebrate shared achievements.')}
              {/*Can change(Page short description)*/}  </p>
                <div className="cta-wrapper">
                  <a href="#about" className="btn btn-primary">About us</a>
                </div>
              </div>
              <div className="col-lg-6 about-images" data-aos="fade-up" data-aos-delay="200">
                <div className="row gy-4">
                  <div className="col-lg-6">
                    {/* Hero image can be added here */}
                  </div>
                  <div className="col-lg-6">
                    <div className="row gy-4">
                      <div className="col-lg-12">
                        {/* Additional images can be added here */}
                      </div>
                      <div className="col-lg-12" style={{ paddingTop: '25px' }}>
                        {/* Additional images can be added here */}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="about section">
          <div className="container">
            <div className="row gy-4">              <div className="col-lg-6 content" data-aos="fade-up" data-aos-delay="100">
                <p className="who-we-are">About us</p>
                <h3 style={{ fontFamily: 'Canela' }}>{getText('companyName', 'EvoluSoft')}{/*Can change(Company Name)*/}</h3>
                
                <p className="fst-italic" style={{ textAlign: 'justify' }}>
                  {getText('companyShortDescription1', 'EvoluSoft Co.Ltd is a dynamic IT company dedicated to delivering innovative software solutions that empower customers to succeed.')}
               {/*Can change(Company short description 1)*/} </p>
                <p className="fst-italic" style={{ textAlign: 'justify' }}>
                  {getText('companyShortDescription2', 'With a team of highly experienced Leaders and technology team including: senior Project mangers, developers, testers, and QA experts, we craft cutting-edge products, especially specialized software\'s for the government sector.')}
               {/*Can change(Company short description 2)*/} </p>
                <p className="fst-italic" style={{ textAlign: 'justify' }}>
                  {getText('companySloganDescription', 'Guided by our slogan "Collaborate to Celebrate," we partner with customers and global technology vendors to bring world-class solutions to businesses and communities. Our commitment to excellence and innovation drives us to forge strategic alliances with leading international software vendors, ensuring our clients thrive in a transformative digital world.')}
               {/*Can change(Company slogan description)*/}  </p>
              </div>

              <div className="col-lg-6 about-images" data-aos="fade-up" data-aos-delay="200" style={{ paddingTop: '30px' }}>
                <img src="/evolusoft/assets/img/about/about1Paperless.jpg" className="img-fluid" alt="" loading="lazy" style={{ height: '350px', width: '100%' }} />
              </div>
            </div>
          </div>
        </section>

        {/* Vision, Mission & Core Values Section */}
        <div className="section-title" style={{ backgroundColor: 'white' }} data-aos="fade-up">
          <h2>Our Vision, Mission, & Core Values</h2>
        </div>
        <section style={{ backgroundColor: 'white' }} className="about section">
          <div className="container" style={{ textAlign: 'justify' }}>
            <div className="row gy-4">
              <div className="col-lg-7 about-images" data-aos="fade-up" data-aos-delay="200">
                <div className="row">
                  <div className="col-lg-12 col-md-12 col-sm-12 equal-height">
                    <div className="item">
                      <i><img src="/evolusoft/assets/img/vision.png" width="100px" alt="Vision" /></i>
                      <ul style={{ listStyleType: 'none' }}>
                        <li><i className="bi bi-check-circle icheck"></i> <span><strong>{getText('companyName', 'EvoluSoft')}{/*Can Change(Company Name)*/}</strong> {getText('companyVision1', 'envisions a world where technology unites people and businesses, driving shared success through seamless collaboration and innovative IT solution.')}{/*Can change(Company Vision 1)*/}</span></li>
                        <li><i className="bi bi-check-circle icheck"></i> <span>{getText('companyVision2', 'We aim to be a dynamic digital landscape, celebrating transformative achievements together.')}{/*Can change(Company Vision 2)*/}</span></li>
                      </ul>
                    </div>
                  </div>
                  <div className="col-lg-12 col-md-12 col-sm-12 equal-height">
                    <div className="item">
                      <i><img src="/evolusoft/assets/img/mission.png" width="100px" alt="Mission" /></i>
                      <ul style={{ listStyleType: 'none' }}>
                        <li><i className="bi bi-check-circle icheck"></i> {getText('companyMission1', 'At EvoluSoft, our mission is to empower customers with innovative IT solution, collaborating closely to drive your success and celebrate shared achievements.')}{/*Can change(Company Mission 1)*/}</li>
                        <li><i className="bi bi-check-circle icheck"></i> {getText('companyMission2', 'By uniting expertise, creativity, and technology, we transform challenges into opportunities for businesses and communities, shaping a brighter digital future.')}{/*Can change(Company Mission 2)*/}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-5 about-images" data-aos="fade-up" data-aos-delay="200">
                <div className="row">
                  <div className="col-lg-12 col-md-12 col-sm-12 equal-height">
                    <div className="item">
                      <i><img src="/evolusoft/assets/img/values.png" width="100px" alt="Values" /></i>
                      <ul style={{ listStyleType: 'none' }}>
                        <li><i className="bi bi-check-circle icheck"></i> {getText('companyValue1', 'Collaboration: We thrive by partnering with customers and teams, uniting talents to achieve shared goals and celebrate collective success.')}{/*Can change(Company Value 1)*/}</li>
                        <li><i className="bi bi-check-circle icheck"></i> {getText('companyValue2', 'Innovation: We deliver cutting-edge technology, creating solutions that empower customers to lead and transform.')}{/*Can change(Company Value 2)*/}</li>
                        <li><i className="bi bi-check-circle icheck"></i> {getText('companyValue3', 'Excellence: We commit to exceptional quality in every project, ensuring outstanding results for our customer.')}{/*Can change(Company Value 3)*/}</li>
                        <li><i className="bi bi-check-circle icheck"></i> {getText('companyValue4', 'Integrity: We build trust with customers through transparency, honesty, and accountability in all our actions.')}{/*Can change(Company Value 4)*/}</li>
                        <li><i className="bi bi-check-circle icheck"></i> {getText('companyValue5', 'Customer Success: We prioritize our customers\' triumphs, delivering solutions that drive their growth and prosperity.')}{/*Can change(Company Value 5)*/}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Organization Chart Section */}
        <section id="team" className="portfolio section light-background">
          <div className="container section-title" data-aos="fade-up">
            <h2>Organization Chart</h2>
          </div>
          <div className="container" data-aos="fade-up" data-aos-delay="100" style={{ textAlign: 'center' }}>
            <img src="/evolusoft/assets/img/so_do_to_chuc_en_3.png" className="img-fluid" alt="" loading="lazy" style={{ height: '500px', width: '80%' }} />
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="services section">
          <div className="container section-title" data-aos="fade-up">
            <h2>Services</h2>
          </div>

          <div className="container" data-aos="fade-up" data-aos-delay="100">
            <div className="row justify-content-center g-5">
              <div className="col-md-6" data-aos="fade-left" data-aos-delay="200">
                <div className="service-item">
                  <div className="service-icon">
                    <i className="bi bi-database"></i>
                  </div>
                  <div className="service-content" style={{ textAlign: 'justify' }}>
                    <h3>{getText('serviceName1', 'Database Services')}{/*Can change(Service Name 1)*/}</h3>
                    <ul style={{ listStyleType: 'none' }}>
                      <li><i className="bi bi-check-circle icheck"></i> <span>{getText('service1Desc1', 'Installation and Configuration.')}{/*Can Change(Service 1 Description 1)*/}</span></li>
                      <li><i className="bi bi-check-circle icheck"></i> <span>{getText('service1Desc2', 'Custom Development and Integration.')}{/*Can Change(Service 1 Description 2)*/}</span></li>
                      <li><i className="bi bi-check-circle icheck"></i> <span>{getText('service1Desc3', 'Troubleshooting and Support.')}{/*Can Change(Service 1 Description 3)*/}</span></li>
                      <li><i className="bi bi-check-circle icheck"></i> <span>{getText('service1Desc4', 'Performance Tuning and Optimization.')}{/*Can Change(Service 1 Description 4)*/}</span></li>
                      <li><i className="bi bi-check-circle icheck"></i> <span>{getText('service1Desc5', 'Maintenance and Health Checks.')}{/*Can Change(Service 1 Description 5)*/}</span></li>
                      <li><i className="bi bi-check-circle icheck"></i> <span>{getText('service1Desc6', 'Backup and Recovery Services.')}{/*Can Change(Service 1 Description 6)*/}</span></li>
                      <li><i className="bi bi-check-circle icheck"></i> <span>{getText('service1Desc7', 'High Availability and Disaster Recovery (HA/DR) Solutions.')}{/*Can Change(Service 1 Description 7)*/}</span></li>
                      <li><i className="bi bi-check-circle icheck"></i> <span>{getText('service1Desc8', 'Security and Compliance.')}{/*Can Change(Service 1 Description 8)*/}</span></li>
                      <li><i className="bi bi-check-circle icheck"></i> <span>{getText('service1Desc9', 'Migration and Upgrades.')}{/*Can Change(Service 1 Description 9)*/}</span></li>
                      <li><i className="bi bi-check-circle icheck"></i> <span>{getText('service1Desc10', 'Monitoring and Alerting.')}{/*Can Change(Service 1 Description 10)*/}</span></li>
                      <li><i className="bi bi-check-circle icheck"></i> <span>{getText('service1Desc11', 'Capacity Planning and Scalability.')}{/*Can Change(Service 1 Description 11)*/}</span></li>
                      <li><i className="bi bi-check-circle icheck"></i> <span>{getText('service1Desc12', 'Consolidation and Virtualization.')}{/*Can Change(Service 1 Description 12)*/}</span></li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="col-md-6" data-aos="fade-left" data-aos-delay="100">
                <div className="service-item">
                  <div className="service-icon">
                    <i className="bi bi-phone-fill"></i>
                  </div>
                  <div className="service-content" style={{ textAlign: 'justify' }}>
                    <h3>{getText('serviceName2', 'Application Development')}{/*Can Change(Service Name 2)*/}</h3>
                    <ul style={{ listStyleType: 'none' }}>
                      <li><i className="bi bi-check-circle icheck"></i> <span>{getText('service2Desc1', 'Custom Application Development.')}{/*Can Change(Service 2 Description 1)*/}</span></li>
                      <li><i className="bi bi-check-circle icheck"></i> <span>{getText('service2Desc2', 'Application Modernization.')}{/*Can Change(Service 2 Description 2)*/}</span></li>
                      <li><i className="bi bi-check-circle icheck"></i> <span>{getText('service2Desc3', 'Database-Driven Application Optimization.')}{/*Can Change(Service 2 Description 3)*/}</span></li>
                      <li><i className="bi bi-check-circle icheck"></i> <span>{getText('service2Desc4', 'API Development and Integration.')}{/*Can Change(Service 2 Description 4)*/}</span></li>
                      <li><i className="bi bi-check-circle icheck"></i> <span>{getText('service2Desc5', 'Business Intelligence (BI) and Reporting Applications.')}{/*Can Change(Service 2 Description 5)*/}</span></li>
                      <li><i className="bi bi-check-circle icheck"></i> <span>{getText('service2Desc6', 'Mobile Application Development.')}{/*Can Change(Service 2 Description 6)*/}</span></li>
                      <li><i className="bi bi-check-circle icheck"></i> <span>{getText('service2Desc7', 'Application Security and Compliance.')}{/*Can Change(Service 2 Description 7)*/}</span></li>
                      <li><i className="bi bi-check-circle icheck"></i> <span>{getText('service2Desc8', 'Application Maintenance and Support.')}{/*Can Change(Service 2 Description 8)*/}</span></li>
                      <li><i className="bi bi-check-circle icheck"></i> <span>{getText('service2Desc9', 'Application Testing and Quality Assurance.')}{/*Can Change(Service 2 Description 9)*/}</span></li>
                      <li><i className="bi bi-check-circle icheck"></i> <span>{getText('service2Desc10', 'Application Migration and Platform Upgrades.')}{/*Can Change(Service 2 Description 10)*/}</span></li>
                      <li><i className="bi bi-check-circle icheck"></i> <span>{getText('service2Desc11', 'User Interface (UI) and User Experience (UX) Design.')}{/*Can Change(Service 2 Description 11)*/}</span></li>
                      <li><i className="bi bi-check-circle icheck"></i> <span>{getText('service2Desc12', 'Training and Documentation.')}{/*Can Change(Service 2 Description 12)*/}</span></li>
                      <li><i className="bi bi-check-circle icheck"></i> <span>{getText('service2Desc13', 'Cloud and Hybrid Application Development.')}{/*Can Change(Service 2 Description 13)*/}</span></li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="col-md-12" data-aos="fade-right" data-aos-delay="200">
                <div className="service-item">
                  <div className="service-icon">
                    <i className="bi bi-palette2"></i>
                  </div>
                  <div className="service-content" style={{ textAlign: 'justify' }}>
                    <h3>{getText('serviceName3', 'System Integration')}{/*Can Change(Service Name 3)*/}</h3>
                    <div className="row">
                      <div className="col-md-6">
                        <ul style={{ listStyleType: 'none' }}>
                          <li><i className="bi bi-check-circle icheck"></i> <span>{getText('service3Desc1', 'System Integration Strategy and Consulting.')}{/*Can Change(Service 3 Description 1)*/}</span></li>
                          <li><i className="bi bi-check-circle icheck"></i> <span>{getText('service3Desc2', 'API-Based Integration.')}{/*Can Change(Service 3 Description 2)*/}</span></li>
                          <li><i className="bi bi-check-circle icheck"></i> <span>{getText('service3Desc3', 'Middleware and Enterprise Service Bus (ESB) Implementation.')}{/*Can Change(Service 3 Description 3)*/}</span></li>
                          <li><i className="bi bi-check-circle icheck"></i> <span>{getText('service3Desc4', 'Database Integration and Data Synchronization.')}{/*Can Change(Service 3 Description 4)*/}</span></li>
                          <li><i className="bi bi-check-circle icheck"></i> <span>{getText('service3Desc5', 'Application Integration.')}{/*Can Change(Service 3 Description 5)*/}</span></li>
                          <li><i className="bi bi-check-circle icheck"></i> <span>{getText('service3Desc6', 'Cloud and Hybrid Integration.')}{/*Can Change(Service 3 Description 6)*/}</span></li>
                          <li><i className="bi bi-check-circle icheck"></i> <span>{getText('service3Desc7', 'Business Process Automation.')}{/*Can Change(Service 3 Description 7)*/}</span></li>
                        </ul>
                      </div>
                      <div className="col-md-6">
                        <ul style={{ listStyleType: 'none' }}>
                          <li><i className="bi bi-check-circle icheck"></i> <span>{getText('service3Desc8', 'Security and Compliance Integration.')}{/*Can Change(Service 3 Description 8)*/}</span></li>
                          <li><i className="bi bi-check-circle icheck"></i> <span>{getText('service3Desc9', 'Monitoring and Performance Management.')}{/*Can Change(Service 3 Description 9)*/}</span></li>
                          <li><i className="bi bi-check-circle icheck"></i> <span>{getText('service3Desc10', 'Data Migration and Transformation.')}{/*Can Change(Service 3 Description 10)*/}</span></li>
                          <li><i className="bi bi-check-circle icheck"></i> <span>{getText('service3Desc11', 'Testing and Validation.')}{/*Can Change(Service 3 Description 11)*/}</span></li>
                          <li><i className="bi bi-check-circle icheck"></i> <span>{getText('service3Desc12', 'Training and Knowledge Transfer.')}{/*Can Change(Service 3 Description 12)*/}</span></li>
                          <li><i className="bi bi-check-circle icheck"></i> <span>{getText('service3Desc13', 'Support and Maintenance.')}{/*Can Change(Service 3 Description 13)*/}</span></li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Solutions for FSI Section */}
        <section id="products" className="products section light-background">
          <div className="container section-title" data-aos="fade-up">
            <h2>Our Solutions for FSI{/*Can Change(Product 1)*/}</h2>
          </div>

          <div className="container" data-aos="fade-up" data-aos-delay="100" style={{ textAlign: 'justify' }}>
            <div className="row gy-4">
              <div className="col-lg-8 about-images" data-aos="fade-up" data-aos-delay="200">
                <div className="row">
                  <div className="col-lg-12 col-md-12 col-sm-12 equal-height">
                    <div className="item">
                      <i><img src="/evolusoft/assets/img/gogreen.png" width="100px" alt="Go Green" /></i>
                      <h4>Paperless Branch e-Form{/*Can Change(Product 1 Description 1)*/}</h4>
                      <p>
                        Paperless Branch e-Form is a digital solution designed to replace paper forms in customer service for the BFSI sector. It allows synchronized digital forms to be shared seamlessly, enabling customers to easily fill out and e-sign forms with guidance from a sales representative.{/*Can Change(D1 Long Description 1)*/}
                      </p>
                    </div>
                  </div>
                  <div className="col-lg-12 col-md-12 col-sm-12 equal-height">
                    <div className="item">
                      <i><img src="/evolusoft/assets/img/tablet3.png" width="100px" alt="Tablet" /></i>
                      <h4>Tablet Branch e-Form{/*Can Change(Product 1 Description 2)*/}</h4>
                      <p>
                        Tablet Branch e-Form is a digital solution designed to optimize mobile POS for client onboarding in field sales. With dynamic, fillable forms, it streamlines complex input and output processes, overcoming the constraints of traditional front-end web applications.{/*Can Change(D2 Long Description 1)*/}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-4 about-images" data-aos="fade-up" data-aos-delay="200">
                <div className="row">
                  <div className="col-lg-12 col-md-12 col-sm-12 equal-height">
                    <div className="item">
                      <i><img src="/evolusoft/assets/img/remotetele.png" width="100px" alt="Remote Teller" /></i>
                      <h4>Remote Teller e-Form{/*Can Change(Product 1 Description 3)*/}</h4>
                      <p>
                        Remote Teller e-Form is a digital solution that enables secure e-signing of contracts between remote clients and sales representatives, facilitating seamless transactions without requiring in-person interaction.{/*Can Change(D3 Long Description 1)*/}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Solutions for Telco Section */}
        <section className="telco-solutions section">
          <div className="container section-title" data-aos="fade-up">
            <h2>Our Solutions for Telco{/*Can Change(Product 2)*/}</h2>
          </div>

          <div className="container" data-aos="fade-up" data-aos-delay="100">
            <div className="row justify-content-center g-5">
              <div className="col-md-6" data-aos="fade-right" data-aos-delay="100">
                <div className="service-item">
                  <div className="service-icon">
                    <i className="bi bi-tablet-fill"></i>
                  </div>
                  <div className="service-content" style={{ textAlign: 'justify' }}>
                    <h3>Tablet Based Electronic Subscription System{/*Can Change(Product 2 Description 1)*/}</h3>
                    <ul style={{ listStyleType: 'none' }}>
                      <li><i className="bi bi-check-circle icheck"></i> <span>Forms: Develop e-Form mobile app for all subscribers.{/*Can Change(D1 Long Description 1)*/}</span></li>
                      <li><i className="bi bi-check-circle icheck"></i> <span>Consolidated distributed form-related tasks, including sales support, imaging systems, and CRM system integration, into a unified solution.{/*Can Change(D1 Long Description 2)*/}</span></li>
                      <li><i className="bi bi-check-circle icheck"></i> <span>One-click integration of additional forms, seamlessly unifying all forms into a single, cohesive solution.{/*Can Change(D1 Long Description 3)*/}</span></li>
                      <li><i className="bi bi-check-circle icheck"></i> <span>Enabled integration with the backend CRM system via web services to automatically prefill customer data on forms.{/*Can Change(D1 Long Description 4)*/}</span></li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="col-md-6" data-aos="fade-left" data-aos-delay="100">
                <div className="service-item">
                  <div className="service-icon">
                    <i className="bi bi-gear-fill"></i>
                  </div>
                  <div className="service-content" style={{ textAlign: 'justify' }}>
                    <h3>Core Features:{/*Can Change(Product 2 Description 2)*/}</h3>
                    <ul style={{ listStyleType: 'none' }}>
                      <li><i className="bi bi-check-circle icheck"></i> <span>Electronic Form Management Process.{/*Can Change(D2 Long Description 1)*/}</span></li>
                      <li><i className="bi bi-check-circle icheck"></i> <span>Electronic Form Type and Permission Management.{/*Can Change(D2 Long Description 2)*/}</span></li>
                      <li><i className="bi bi-check-circle icheck"></i> <span>Common Item Mapping Management.{/*Can Change(D2 Long Description 3)*/}</span></li>
                      <li><i className="bi bi-check-circle icheck"></i> <span>Image Storage and Transmission History Management.{/*Can Change(D2 Long Description 4)*/}</span></li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="col-md-6" data-aos="fade-right" data-aos-delay="200">
                <div className="service-item">
                  <div className="service-icon">
                    <i className="bi bi-newspaper"></i>
                  </div>
                  <div className="service-content" style={{ textAlign: 'justify' }}>
                    <h3>e-Contract System{/*Can Change(Product 2 Description 3)*/}</h3>
                    <ul style={{ listStyleType: 'none' }}>
                      <li><i className="bi bi-check-circle icheck"></i> <span>Covered for Mobile phone / Tablet PC communication service, IPTV / Internet service subscription and change.{/*Can Change(D3 Long Description 1)*/}</span></li>
                      <li><i className="bi bi-check-circle icheck"></i> <span>The e-contract system for signing up / modifying service directly from tablet PC.{/*Can Change(D3 Long Description 2)*/}</span></li>
                      <li><i className="bi bi-check-circle icheck"></i> <span>Attach customer ID card image and customer digital signature into an electronic document.{/*Can Change(D3 Long Description 3)*/}</span></li>
                      <li><i className="bi bi-check-circle icheck"></i> <span>Send PDF contract document as a copy directly to customer's email.{/*Can Change(D3 Long Description 4)*/}</span></li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="col-md-6" data-aos="fade-left" data-aos-delay="200">
                <div className="service-item">
                  <div className="service-icon">
                    <i className="bi bi-building-fill-gear"></i>
                  </div>
                  <div className="service-content" style={{ textAlign: 'justify' }}>
                    <h3>Branch Office Digitization{/*Can Change(Product 2 Description 4)*/}</h3>
                    <ul style={{ listStyleType: 'none' }}>
                      <li><i className="bi bi-check-circle icheck"></i> <span>Digitalization of paper forms for paid and unpaid leave.{/*Can Change(D4 Long Description 1)*/}</span></li>
                      <li><i className="bi bi-check-circle icheck"></i> <span>Paperless transformation of sales processes.{/*Can Change(D4 Long Description 2)*/}</span></li>
                      <li><i className="bi bi-check-circle icheck"></i> <span>Process approval through workflow automation.{/*Can Change(D4 Long Description 3)*/}</span></li>
                      <li><i className="bi bi-check-circle icheck"></i> <span>Digital e-signing of approved documents.{/*Can Change(D4 Long Description 4)*/}</span></li>
                      <li><i className="bi bi-check-circle icheck"></i> <span>Document archiving in corporate DMS system.{/*Can Change(D4 Long Description 5)*/}</span></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Solutions for Public Sector Section */}
        <section className="public-sector-solutions section">
          <div className="container section-title" data-aos="fade-up">
            <h2>Our Solutions for Public Sector{/*Can Change(Product 3)*/}</h2>
          </div>

          <div className="container" data-aos="fade-up" data-aos-delay="100">
            <div className="row justify-content-center g-5">
              <div className="col-md-6" data-aos="fade-right" data-aos-delay="100">
                <div className="service-item">
                  <div className="service-icon">
                    <i className="bi bi-building-fill"></i>
                  </div>
                  <div className="service-content" style={{ textAlign: 'justify' }}>
                    <ul style={{ listStyleType: 'none' }}>
                      <li><i className="bi bi-check-circle icheck"></i> <span>GS-CMS Electronic Publishing System.{/*Can Change(Product 3 Description 1)*/}</span></li>
                      <li><i className="bi bi-check-circle icheck"></i> <span>Fixed Asset Management.{/*Can Change(Product 3 Description 2)*/}</span></li>
                      <li><i className="bi bi-check-circle icheck"></i> <span>Finance and Budget Management.{/*Can Change(Product 3 Description 3)*/}</span></li>
                      <li><i className="bi bi-check-circle icheck"></i> <span>Project Budget Management and Project Settlement.{/*Can Change(Product 3 Description 4)*/}</span></li>
                      <li><i className="bi bi-check-circle icheck"></i> <span>Civil Servants and Public Employees Management.{/*Can Change(Product 3 Description 5)*/}</span></li>
                      <li><i className="bi bi-check-circle icheck"></i> <span>Centralized Purchasing Management Software.{/*Can Change(Product 3 Description 6)*/}</span></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="contact section">
          <div className="container section-title" data-aos="fade-up">
            <h2>Contact Us</h2>
            <p>Please fill in the information below or contact our customer service number. We will contact you directly immediately.</p>
          </div>

          <div className="container" data-aos="fade-up" data-aos-delay="100">
            <div className="row gy-4 mb-5">
              <div className="col-lg-4" data-aos="fade-up" data-aos-delay="100">
                <div className="info-card">
                  <div className="icon-box">
                    <i className="bi bi-geo-alt"></i>
                  </div>
                  <h3>Headquarters</h3>
                  <p>{getText('contactAddress', '16, BT4-3, Vinaconex 3 - Trung Van, Nam Tu Liem, Hanoi, Vietnam')}{/*Can Change(Headquarters Address)*/}</p>
                </div>
              </div>

              <div className="col-lg-4" data-aos="fade-up" data-aos-delay="200">
                <div className="info-card">
                  <div className="icon-box">
                    <i className="bi bi-telephone"></i>
                  </div>
                  <h3>Contact number</h3>
                  <p>Phone (hotline): {getText('contactPhone', '(024) 73046618')}{/*Can Change(Hotline Number)*/}<br />
                    Email: {getText('contactEmail', 'support@evolusoft.vn')}{/*Can Change(Support Email)*/}</p>
                </div>
              </div>

              <div className="col-lg-4" data-aos="fade-up" data-aos-delay="300">
                <div className="info-card">
                  <div className="icon-box">
                    <i className="bi bi-clock"></i>
                  </div>
                  <h3>Working time</h3>
                  <p>Monday - Friday: {getText('workingHoursWeekday', '8:00 - 17:00')}{/*Can Change(Working Hours Weekday)*/}<br />
                     Saturday: {getText('workingHoursWeekend', '8:00 - 12:00')}{/*Can Change(Working Hours Weekend)*/}</p>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-lg-12">
                <div className="form-wrapper" data-aos="fade-up" data-aos-delay="400">
                  <form onSubmit={handleSubmit} className="php-email-form">
                    <div className="row">
                      <div className="col-md-6 form-group">
                        <div className="input-group">
                          <span className="input-group-text"><i className="bi bi-person"></i></span>
                          <input 
                            type="text" 
                            name="name" 
                            className="form-control" 
                            placeholder="Name*" 
                            value={formData.name}
                            onChange={handleInputChange}
                            required 
                          />
                        </div>
                      </div>
                      <div className="col-md-6 form-group">
                        <div className="input-group">
                          <span className="input-group-text"><i className="bi bi-envelope"></i></span>
                          <input 
                            type="email" 
                            className="form-control" 
                            name="email" 
                            placeholder="Email*"
                            value={formData.email}
                            onChange={handleInputChange}
                            required 
                          />
                        </div>
                      </div>
                    </div>
                    <div className="row mt-3">
                      <div className="col-md-6 form-group">
                        <div className="input-group">
                          <span className="input-group-text"><i className="bi bi-phone"></i></span>
                          <input 
                            type="text" 
                            className="form-control" 
                            name="phone" 
                            placeholder="Phone*"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required 
                          />
                        </div>
                      </div>
                      <div className="col-md-6 form-group">
                        <div className="input-group">
                          <span className="input-group-text"><i className="bi bi-list"></i></span>
                          <select 
                            name="request_service" 
                            className="form-control"
                            value={formData.request_service}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="">Select service*</option>
                            <option value="Consulting">Consulting</option>
                            <option value="Development">Development</option>
                            <option value="Marketing">Marketing</option>
                            <option value="Support">Support</option>
                            {/*Can Change(Subject Options)*/}
                          </select>
                        </div>
                      </div>
                      <div className="form-group mt-3">
                        <div className="input-group">
                          <span className="input-group-text"><i className="bi bi-chat-dots"></i></span>
                          <textarea 
                            className="form-control" 
                            name="request_content" 
                            rows="6" 
                            placeholder="Nội dung yêu cầu*"
                            value={formData.request_content}
                            onChange={handleInputChange}
                            required
                          ></textarea>
                        </div>
                      </div>
                      <div className="my-3">
                        {isLoading && <div className="loading">Loading</div>}
                        {message.type === 'error' && <div className="error-message">{message.text}</div>}
                        {message.type === 'success' && <div className="sent-message">{message.text}</div>}
                      </div>
                      <div className="text-center">
                        <button type="submit" disabled={isLoading}>Send</button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer id="footer" className="footer light-background">
        <div className="container footer-top">
          <div className="row gy-4">
            <div className="col-lg-4 col-md-6 footer-about">
              <a href="#hero" className="logo d-flex align-items-center">
                <span className="sitename">EvoluSoft Technology Company Limited</span>
              </a>
              <div className="footer-contact pt-3">
                <p>{getText('contactAddress', '16, BT4-3, Vinaconex 3 - Trung Van').split(',')[0]}</p>
                <p>{getText('contactAddress', '16, BT4-3, Vinaconex 3 - Trung Van, Nam Tu Liem, Hanoi, Vietnam').split(',').slice(1).join(',').trim()}</p>
                <p className="mt-3"><strong>Phone (hotline):</strong> <span>{getText('contactPhone', '(024) 73046618')}</span></p>
                <p><strong>Email:</strong> <span>{getText('contactEmail', 'support@evolusoft.vn')}</span></p>
              </div>
            </div>

            <div className="col-lg-2 col-md-3 footer-links">
              <h4>Quick access</h4>
              <ul>
                <li><a href="#hero">Home</a></li>
                <li><a href="#about">About us</a></li>
                <li><a href="#contact">Contact</a></li>
                <li><a href="#services">Services</a></li>
                <li><a href="/news">All News</a></li>
              </ul>
            </div>

            <div className="col-lg-2 col-md-3 footer-links">
              <h4>The Core services</h4>
              <ul>
                <li><a href="#services">{getText('serviceName1', 'Database Services')}</a></li>
                <li><a href="#services">{getText('serviceName2', 'Application Development')}</a></li>
                <li><a href="#services">{getText('serviceName3', 'System Integration')}</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="container copyright text-center mt-4">
          <p>© <span>Copyright 2025</span> <strong className="px-1 sitename">EvoluSoft Technology Company Limited</strong> <span>All Rights Reserved</span></p>
        </div>
      </footer>

      {/* Scroll Top */}
      <a href="#" id="scroll-top" className="scroll-top d-flex align-items-center justify-content-center">
        <i className="bi bi-arrow-up-short"></i>
      </a>
    </div>
  );
};

export default EvolusoftHomePage;
