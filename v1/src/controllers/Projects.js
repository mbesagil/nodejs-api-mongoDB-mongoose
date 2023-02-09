const httpStatus = require("http-status");

const { list, insert, modify, remove } = require("../services/Projects");

const index = (req, res) => {
  list()
    .then((response) => {
      res.status(httpStatus.OK).send(response);
    })
    .catch((error) => {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).send(error);
    });
};

const create = (req, res) => {
  // req.body.user_id = req?.user?._id;
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
    .then((updatedProject) => {
      res.status(httpStatus.OK).send(updatedProject);
    })
    .catch((e) =>
      res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .send({ error: "Kayıt sırasında bi problem oluştu.." })
    );
};

const deleteProject = (req, res) => {
  if (!req.params?.id) {
    return res.status(httpStatus.BAD_REQUEST).send({
      message: "Id infermotion crash",
    });
  }

  remove(req.params?.id)
    .then((deletedProject) => {
      if (!deleteProject) {
        return res
          .status(httpStatus.NOT_FOUND)
          .send({ message: "this project not found" });
      }
      res
        .status(httpStatus.OK)
        .send({ message: `project ${deletedProject?.name} deleted` });
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
  deleteProject,
};
