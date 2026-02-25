import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import authReducer from '../reducers/authReducer';
import userReducer from '../reducers/userReducer';
import appointmentReducer from '../reducers/appointmentReducer';

const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  appointments: appointmentReducer,
});

const store = createStore(rootReducer, applyMiddleware(thunk));

export default store;