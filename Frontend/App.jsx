import Sidebar from './components/Sidebar';
import TaskModule from './components/TaskModule';

function App(){
  return (
    <div style={{display:'flex'}}>
      <Sidebar />
      <main style={{padding:'20px', flex:1}}>
        <h2>Dashboard</h2>
        <TaskModule title="Task 1" description="Fix bug in login" status="Pending" />
        <TaskModule title="Task 2" description="Design homepage" status="Completed" />
      </main>
    </div>
  );
}
export default App;
