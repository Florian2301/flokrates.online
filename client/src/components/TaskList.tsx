import { Button, Form, ListGroup } from 'react-bootstrap'
import React, { useEffect, useState } from 'react'

import { Task } from './TaskInterface'

interface TaskListProps {
  tasks: Task[]
}

const TaskList: React.FC<TaskListProps> = ({ tasks }) => {
  const [localTasks, setLocalTasks] = useState<Task[]>([])

  useEffect(() => {
    fetch('http://localhost:8080/task/getAll')
      .then((res) => res.json())
      .then((result: Task[]) => {
        setLocalTasks(result)
      })
      .catch((error) => {
        console.error('Error fetching tasks:', error)
      })
  }, [])

  const handleClick = (taskId: number): void => {
    fetch('http://localhost:8080/task/' + taskId, {
      method: 'DELETE',
    })
      .then(() => console.log('task ' + taskId + ' sucessfully deleted'))
      .catch((error) => {
        console.error('Error deleting task:', error)
      })
  }

  return (
    <ListGroup>
      {localTasks.map((task: Task) =>
        task.title ? (
          <ListGroup.Item key={task.id} style={{ textAlign: 'left' }}>
            <div>task: {task.id}</div>
            <div>title: {task.title}</div>

            <Form.Group>
              <Form.Label className='me-3'>completed:</Form.Label>

              <Form.Check
                inline
                type={'checkbox'}
                id={task.id?.toString()}
                checked={task.completed}
              />
              <Button
                id={task.id?.toString()}
                variant='secondary'
                onClick={() => handleClick(task.id)}
              >
                Delete
              </Button>
            </Form.Group>
          </ListGroup.Item>
        ) : null
      )}
    </ListGroup>
  )
}

export default TaskList
