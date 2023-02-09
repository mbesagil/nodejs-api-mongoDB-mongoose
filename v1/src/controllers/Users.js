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
          .send({ error: "böyle bir kullanıcı bulunmamaktadır.." });

      eventEmitter.emit("send_email", {
        to: updatedUser.email,
        subject: "Şifre Sıfrılama",
        html: `Talebiniz üzerinde şifre sıfırlama işleminiz gerçekleştirilmiştir. </br> Giriş yaptıktan sonra şifrenizi değiştrimeyi unutmayın. </br> Yeni şifreniz: ${new_password}`,
      });

      res.status(httpStatus.OK).send({
        message: "şifre sıfırlama sağladnı mailinizi kontrol ediniz...",
      });
    })
    .catch(() => {
      res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .send({ error: "şifre yenileme esnasında hata olultu..." });
    });
};

const changePassword = (req, res) => {
  req.body.password = passwordToHash(req.body.password);
  //!.. UI geldiğinde şifre karşılaştırmasına ilişkin işlermler yapılacaktır.
  modify({ _id: req.user?._id }, req.body)
    .then((updatedUser) => {
      res.status(httpStatus.OK).send(updatedUser);
    })
    .catch(() => {
      res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .send({ error: "Güncelleme yapılırken sorun yaşandı..!" });
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
        .send({ error: "Güncelleme yapılırken sorun yaşandı..!" });
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
        .send({ error: "Kayıt sırasında bi problem oluştu.." })
    );
};

const updateProfileImage = (req, res) => {
  // 1- resim kontrolü
  if (!req.files.profile_image) {
    res
      .status(httpStatus.BAD_REQUEST)
      .send({ error: "bu işlem için yeterli veri yok" });
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

  // 2- upload işlemi
  // 3- DB save işlemi
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
