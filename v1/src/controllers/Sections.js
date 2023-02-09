const httpStatus = require("http-status");

const { list, insert, modify, remove } = require("../services/Sections");

const index = (req, res) => {
  if (!req?.params?.projectId) {
    console.log("dene ");
    return res.status(httpStatus.BAD_REQUEST)
      .send({ error: "proje id bilgisi eksik..." });
  }
  list({ project_id: req.params.projectId })
    .then((response) => {
      res.status(httpStatus.OK).send(response);
    })
    .catch((error) => {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).send(error);
    });
};

const create = (req, res) => {
  req.body.user_id = req.user;
  insert(req.body)
    .then((response) => res.status(httpStatus.CREATED).send(response))
    .catch((err) => res.status(httpStatus.INTERNAL_SERVER_ERROR).send(err));
};

const update = (req, res) => {
  // console.log(req.params.id);
  if (!req.params?.id) {
    return res.status(httpStatus.BAD_REQUEST).send({
      message: "Id infermotion crash",
    });
  }

  modify(req.params?.id, req.body)
    .then((updatedDoc) => {
      res.status(httpStatus.OK).send(updatedDoc);
    })
    .catch((e) =>
      res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .send({ error: "Kayıt sırasında bi problem oluştu.." })
    );
};

const deleteSection = (req, res) => {
  if (!req.params?.id) {
    return res.status(httpStatus.BAD_REQUEST).send({
      message: "Id infermotion crash",
    });
  }

  remove(req.params?.id)
    .then((deletedDoc) => {
      if (!deletedDoc) {
        return res
          .status(httpStatus.NOT_FOUND)
          .send({ message: "this section not found" });
      }
      res
        .status(httpStatus.OK)
        .send({ message: `Doc ${deletedDoc?.name} deleted` });
    })
    .catch((e) =>
      res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .send({ error: "Kayıt sırasında bi problem oluştu.." })
    );
};

module.exports = {
  create,
  index,
  update,
  deleteSection,
};
