// Service for managing EvoluSoft homepage text configuration via Django API (Frontend)
class TextConfigService {
  constructor() {
    this.apiUrl = 'http://192.168.1.36:8000/api/text-config';
    this.defaultTexts = {
      // Hero Section
      pageSlogan: 'Innovate together, Succeed Together',
      pageShortDescription: 'EvoluSoft harnesses cutting-edge technology, collaborating globally with clients to deliver transformative solutions, drive success, and celebrate shared achievements.',
      
      // Company Info
      companyName: 'EvoluSoft',
      companyShortDescription1: 'EvoluSoft Co.Ltd is a dynamic IT company dedicated to delivering innovative software solutions that empower customers to succeed.',
      companyShortDescription2: 'With a team of highly experienced Leaders and technology team including: senior Project mangers, developers, testers, and QA experts, we craft cutting-edge products, especially specialized software\'s for the government sector.',
      companySloganDescription: 'Guided by our slogan "Collaborate to Celebrate," we partner with customers and global technology vendors to bring world-class solutions to businesses and communities. Our commitment to excellence and innovation drives us to forge strategic alliances with leading international software vendors, ensuring our clients thrive in a transformative digital world.',
      
      // Vision & Mission
      companyVision1: 'EvoluSoft envisions a world where technology unites people and businesses, driving shared success through seamless collaboration and innovative IT solution.',
      companyVision2: 'We aim to be a dynamic digital landscape, celebrating transformative achievements together.',
      companyMission1: 'At EvoluSoft, our mission is to empower customers with innovative IT solution, collaborating closely to drive your success and celebrate shared achievements.',
      companyMission2: 'By uniting expertise, creativity, and technology, we transform challenges into opportunities for businesses and communities, shaping a brighter digital future.',
      
      // Company Values
      companyValue1: 'Collaboration: We thrive by partnering with customers and teams, uniting talents to achieve shared goals and celebrate collective success.',
      companyValue2: 'Innovation: We deliver cutting-edge technology, creating solutions that empower customers to lead and transform.',
      companyValue3: 'Excellence: We commit to exceptional quality in every project, ensuring outstanding results for our customer.',
      companyValue4: 'Integrity: We build trust with customers through transparency, honesty, and accountability in all our actions.',
      companyValue5: 'Customer Success: We prioritize our customers\' triumphs, delivering solutions that drive their growth and prosperity.',
      
      // Services
      serviceName1: 'Database Services',
      serviceName2: 'Application Development',
      serviceName3: 'System Integration',
      
      // Database Services Descriptions (Service 1)
      service1Desc1: 'Installation and Configuration.',
      service1Desc2: 'Custom Development and Integration.',
      service1Desc3: 'Troubleshooting and Support.',
      service1Desc4: 'Performance Tuning and Optimization.',
      service1Desc5: 'Maintenance and Health Checks.',
      service1Desc6: 'Backup and Recovery Services.',
      service1Desc7: 'High Availability and Disaster Recovery (HA/DR) Solutions.',
      service1Desc8: 'Security and Compliance.',
      service1Desc9: 'Migration and Upgrades.',
      service1Desc10: 'Monitoring and Alerting.',
      service1Desc11: 'Capacity Planning and Scalability.',
      service1Desc12: 'Consolidation and Virtualization.',
      
      // Application Development Descriptions (Service 2)
      service2Desc1: 'Custom Application Development.',
      service2Desc2: 'Application Modernization.',
      service2Desc3: 'Database-Driven Application Optimization.',
      service2Desc4: 'API Development and Integration.',
      service2Desc5: 'Business Intelligence (BI) and Reporting Applications.',
      service2Desc6: 'Mobile Application Development.',
      service2Desc7: 'Application Security and Compliance.',
      service2Desc8: 'Application Maintenance and Support.',
      service2Desc9: 'Application Testing and Quality Assurance.',
      service2Desc10: 'Application Migration and Platform Upgrades.',
      service2Desc11: 'User Interface (UI) and User Experience (UX) Design.',
      service2Desc12: 'Training and Documentation.',
      service2Desc13: 'Cloud and Hybrid Application Development.',
      
      // System Integration Descriptions (Service 3)
      service3Desc1: 'System Integration Strategy and Consulting.',
      service3Desc2: 'API-Based Integration.',
      service3Desc3: 'Middleware and Enterprise Service Bus (ESB) Implementation.',
      service3Desc4: 'Database Integration and Data Synchronization.',
      service3Desc5: 'Application Integration.',
      service3Desc6: 'Cloud and Hybrid Integration.',
      service3Desc7: 'Business Process Automation.',
      service3Desc8: 'Security and Compliance Integration.',
      service3Desc9: 'Monitoring and Performance Management.',
      service3Desc10: 'Data Migration and Transformation.',
      service3Desc11: 'Testing and Validation.',
      service3Desc12: 'Training and Knowledge Transfer.',
      service3Desc13: 'Support and Maintenance.',
      
      // Contact Information
      contactAddress: '16, BT4-3, Vinaconex 3 - Trung Van, Nam Tu Liem, Hanoi, Vietnam',
      contactPhone: '(024) 73046618',
      contactEmail: 'support@evolusoft.vn',
      workingHoursWeekday: 'Monday - Friday: 8:00 - 17:00',
      workingHoursWeekend: 'Saturday: 8:00 - 12:00'
    };
  }

  // Get all text configurations from Django API
  async getTexts() {
    try {
      const response = await fetch(this.apiUrl);
      if (response.ok) {
        const result = await response.json();
        return result.data || this.defaultTexts;
      } else {
        return this.defaultTexts;
      }
    } catch (error) {
      return this.defaultTexts;
    }
  }

  // Get a specific text value
  getText(key) {
    // This should be used with the async getTexts() method
    return this.defaultTexts[key] || '';
  }

  // Save text configurations to Django API (frontend doesn't usually save, but kept for compatibility)
  async saveTexts(texts) {
    try {
      const response = await fetch(`${this.apiUrl}/update/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(texts),
      });

      if (response.ok) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  // Reset to default texts
  async resetTexts() {
    try {
      const response = await fetch(`${this.apiUrl}/reset/`, {
        method: 'POST',
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // Check if Django API server is available
  async checkApiHealth() {
    try {
      const response = await fetch('http://192.168.1.36:8000/api/health/');
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // Listen for changes (useful for real-time updates)
  onTextChange(callback) {
    // For API-based approach, we'll use polling
    const pollInterval = setInterval(async () => {
      try {
        const currentTexts = await this.getTexts();
        callback(currentTexts);
      } catch (error) {
        // Silently handle polling errors
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(pollInterval);
  }
}

const textConfigService = new TextConfigService();
export { textConfigService };
export default textConfigService;
