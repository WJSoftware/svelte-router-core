<Router hash id="my-hash-router">
  <Route hash key="home" path="/">
    <HomePage />
  </Route>
  <Route hash key="profile" path="/profile/:userId">
    <ProfilePage />
  </Route>
</Router>
