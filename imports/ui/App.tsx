import * as React from "react";
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
  useLocation,
  useParams,
} from "react-router-dom";

import { useTracker } from "meteor/react-meteor-data";

import { useState } from "react";
import { TakePollPage } from "./TakePollPage/TakePollPage";
import { PollListPage } from "./PollListPage/PollListPage";
import { PollPage } from "./PollPage/PollPage";
import SignInPage from "./SignInPage/SignInPage";
import { QuestionsPage } from "./PollPage/QuestionsPage/QuestionsPage";
import { ResponsesPage } from "./PollPage/ResponsesPage/ResponsesPage";
import { NavWrapper } from "./NavWrapper";
import { PollCollection } from "../api/pollCollection";

const ProtectedPage = ({ children }: { children: JSX.Element }) => {
  const location = useLocation();
  const userId = useTracker(() => Meteor.userId());
  if (!userId) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
};

const protect = (child: JSX.Element) => {
  return <ProtectedPage>{child}</ProtectedPage>;
};


export const App = (): JSX.Element => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={protect(<Navigate to="/polls" replace />)} />
        <Route path="/login" element={<SignInPage />} />
        <Route path="/poll">
          <Route path=":id" element={<TakePollPage />} />
        </Route>
        <Route path="/polls" element={protect(<NavWrapper />)}>
          <Route element={protect(<PollListPage />)} index />
          <Route path=":id" element={protect(<PollPage />)}>
            <Route path="questions" element={protect(<QuestionsPage />)} />
            <Route path="responses" element={protect(<ResponsesPage />)} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
};
