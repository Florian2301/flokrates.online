import './About.css';

import React from 'react';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import { selectAllAbouts } from '../../store/aboutSlice';
import { useSelector } from 'react-redux';

const About = () => {
  const abouts = useSelector(selectAllAbouts);

  const renderSection = (key: string) => {
    const items = abouts.filter((a) => a.sectionKey === key);
    return (
      <div>
        {items.map((item) => (
          <section key={item.id}>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </section>
        ))}
      </div>
    );
  };

  return (
    <div className="about-wrapper">
      <Tabs defaultActiveKey="project" id="about-tabs" className="mb-3">
        <Tab eventKey="project" title="Project">
          {renderSection('project')}
        </Tab>
        <Tab eventKey="author" title="Author">
          {renderSection('author')}
        </Tab>
        <Tab eventKey="flokrates" title="Flokrates">
          {renderSection('flokrates')}
        </Tab>
        <Tab eventKey="lotharius" title="Lotharius">
          {renderSection('lotharius')}
        </Tab>
        <Tab eventKey="pablo" title="Pablo">
          {renderSection('pablo')}
        </Tab>
      </Tabs>
    </div>
  );
};

export default About;
