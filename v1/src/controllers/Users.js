const projectService = require("../services/Projects");
const uuid = require("uuid");
const eventEmitter = require("../scripts/events/eventEmitter");
const httpStatus = require("http-status");
const path = require("path");

const {
  insert,
  list,
  loginUser,
  modify,
  remove,
} = require("../services/Users");

const {
  passwordToHash,
  generateAccessToken,
  generateRefreshToken,
} = require("../scripts/utils/helper");

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
  //salt password...//
  req.body.password = passwordToHash(req.body.password);
  insert(req.body)
    .then((response) => res.status(httpStatus.CREATED).send(response))
    .catch((err) => res.status(httpStatus.INTERNAL_SERVER_ERROR).send(err));
};

const login = (req, res) => {
  req.body.password = passwordToHash(req.body.password);
  loginUser(req.body)
    .then((user) => {
      // console.log(response);
      if (!user)
        return res
          .status(httpStatus.NOT_FOUND)
          .send({ message: "User Not Found !" });

      user = {
        ...user.toObject(),
        token: {
          access_token: generateAccessToken(user),
          refresh_token: generateRefreshToken(user),
        },
      };
      delete user.password;
      res.status(httpStatus.OK).send(user);
    })
    .catch((e) => res.status(httpStatus.INTERNAL_SERVER_ERROR).send(e));
};

const projectList = (req, res) => {
  projectService
    .list({ user_id: req.user?._id })
    .then((projects) => {
      res.status(httpStatus.OK).send(projects);
    })
    .catch(() =>
      res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .send({ error: "projeler gelirken hata oldu..." })
    );
};

const resetPassword = (req, res) => {
  const new_password =
    uuid.v4()?.split("-")[0] || `ust-${new Date().getTime()}`;

  modify({ email: req.body.email }, { password: passwordToHash(new_password) })
    .then((updatedUser) => {
      if (!updatedUser)
        return res
          .status(httpStatus.NOT_FOUND)
          .send({ error: "b??yle bir kullan??c?? bulunmamaktad??r.." });

      eventEmitter.emit("send_email", {
        to: updatedUser.email,
        subject: "??ifre S??fr??lama",
        html: `Talebiniz ??zerinde ??ifre s??f??rlama i??leminiz ger??ekle??tirilmi??tir. </br> Giri?? yapt??ktan sonra ??ifrenizi de??i??trimeyi unutmay??n. </br> Yeni ??ifreniz: ${new_password}`,
      });

      res.status(httpStatus.OK).send({
        message: "??ifre s??f??rlama sa??ladn?? mailinizi kontrol ediniz...",
      });
    })
    .catch(() => {
      res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .send({ error: "??ifre yenileme esnas??nda hata olultu..." });
    });
};

const changePassword = (req, res) => {
  req.body.password = passwordToHash(req.body.password);
  //!.. UI geldi??inde ??ifre kar????la??t??rmas??na ili??kin i??lermler yap??lacakt??r.
  modify({ _id: req.user?._id }, req.body)
    .then((updatedUser) => {
      res.status(httpStatus.OK).send(updatedUser);
    })
    .catch(() => {
      res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .send({ error: "G??ncelleme yap??l??rken sorun ya??and??..!" });
    });
};

const update = (req, res) => {
  modify({ _id: req.user?._id }, req.body)
    .then((updatedUser) => {
      res.status(httpStatus.OK).send(updatedUser);
    })
    .catch(() => {
      res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .send({ error: "G??ncelleme yap??l??rken sorun ya??and??..!" });
    });
};

const deleteUser = (req, res) => {
  if (!req.params?.id) {
    return res.status(httpStatus.BAD_REQUEST).send({
      message: "Id infermotion crash",
    });
  }

  remove(req.params?.id)
    .then((deleteUser) => {
      if (!deleteUser) {
        return res
          .status(httpStatus.NOT_FOUND)
          .send({ message: "this user not found" });
      }
      res
        .status(httpStatus.OK)
        .send({ message: `user ${deleteUser?.full_name} deleted` });
    })
    .catch((e) =>
      res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .send({ error: "Kay??t s??ras??nda bi problem olu??tu.." })
    );
};

const updateProfileImage = (req, res) => {
  // 1- resim kontrol??
  if (!req.files.profile_image) {
    res
      .status(httpStatus.BAD_REQUEST)
      .send({ error: "bu i??lem i??in yeterli veri yok" });
  }
  const extension = path.extname(req.files.profile_image.name);
  const fileName = `${req?.user._id}${extension}`;
  const folderPath = path.join(__dirname, "../", "uploads/users", fileName);

  console.log("folderPath", folderPath);

  req.files.profile_image.mv(folderPath, function (err) {
    if (err)
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ error: err });

    modify({ _id: req?.user?._id }, { profile_image: fileName })
      .then((updatedUser) => {
        res.status(httpStatus.OK).send({ message: updatedUser });
      })
      .catch((err) => {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ error: err });
      });
  });

  // 2- upload i??lemi
  // 3- DB save i??lemi
  // 4- response
};

module.exports = {
  create,
  index,
  login,
  projectList,
  resetPassword,
  changePassword,
  update,
  deleteUser,
  updateProfileImage,
};
