import NewTask from './NewTask'
import React from 'react'
import TaskList from './TaskList'

const Task: React.FC = () => {
  return (
    <div style={{ marginLeft: 100, marginTop: 50, width: 300 }}>
      <h3>Aufgabenverwaltung</h3>
      <TaskList tasks={[]}></TaskList>
      <NewTask></NewTask>
    </div>
  )
}

export default Task
