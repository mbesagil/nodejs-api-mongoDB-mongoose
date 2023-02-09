const express = require("express");
const fileUpload = require("express-fileupload");
const helmet = require("helmet");
const config = require("./config/index.js");
const loaders = require("./loaders/index.js");
const events = require("./scripts/events");
const path = require("path");
const { ProjectRoutes, UserRoutes, SectionRoutes } = require("./api-routes");

config();
loaders();
events();

const app = express();
app.use("/uploads", express.static(path.join(__dirname, "./", "uploads")));
app.use(express.json());
app.use(helmet());
app.use(fileUpload());

app.listen(process.env.APP_PORT, () => {
  console.log("sunucu ayağa kalktı");
  app.use("/projects", ProjectRoutes); //projectsten gelenlere cevap ver
  app.use("/users", UserRoutes); //projectsten gelenlere cevap ver
  app.use("/sections", SectionRoutes); //projectsten gelenlere cevap ver
});
