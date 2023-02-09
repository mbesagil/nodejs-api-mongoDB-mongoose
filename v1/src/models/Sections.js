const Mongoose = require("mongoose");
const logger = require("../scripts/logger/Section");
const SectionSchema = new Mongoose.Schema(
  {
    name: String,
    user_id: {
      type: Mongoose.Types.ObjectId,
      ref: "user",
    },
    project_id: {
      type: Mongoose.Types.ObjectId,
      ref: "project",
    },
    order_id: Number,
  },
  { versionKey: false, timestamps: true }
);

SectionSchema.post("save", (doc) => {
  //   console.log("Saving Project....", doc);
  logger.log({
    level: "info",
    message: doc,
  });
});

module.exports = Mongoose.model("section", SectionSchema);
