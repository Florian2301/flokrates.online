import React from 'react';
import { selectAllAbouts } from '../../store/aboutSlice';
import { useSelector } from 'react-redux';

const about = useSelector(selectAllAbouts);

const Project = (key: string) => {
  return <div></div>;
};

export default Project;
