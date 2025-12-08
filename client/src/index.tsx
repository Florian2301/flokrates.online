import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';

import App from './App';
import { Provider } from 'react-redux';
import ReactDOM from 'react-dom/client';
import { rehydrateFromToken } from './store/authSlice';
import { store } from './store/store';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

store.dispatch(rehydrateFromToken());

root.render(
  <Provider store={store}>
    <App />
  </Provider>
);
