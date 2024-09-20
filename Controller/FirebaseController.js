const admin = require('firebase-admin');
const AppError = require('../utils/AppError');

const serviceAccount = {
  type: 'service_account',
  project_id: 'all-backend-fd5c7',
  private_key_id: 'ef59a605949ea981478c376aab01d31b5c3e34e0',
  private_key:
    '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCyshEvnMU/Z4pb\nAz/CwkZ1gzYvzn4VmhlA/+1h9z0K006UXGoOBDPcC92Ny2ShKN3gdd+BCD3BMVZP\nIv/utOJECSXWUlFTIltndQF2+vvresNuM27CunaevNvaHRhAiKm0EhjIEakIPt0r\nolPpWegujSB8g7gOAjI885jNHv/nxFev/XwOgrxVlbznVuCKeaAhFylyEPRzkQB/\nendoEZWhEGXRw4lqZdVCxOD2Bz2GwCMkdkESsnm9jdU5l5YvQiWIVo7v5St2YuS7\nOHXnr8sK6zf1/q6kDVe6ZSEjJh55Zlkcjvt57/D9fEx6+0P5tVprRX2e+9bDtA/z\nOcaDXVi7AgMBAAECggEAMHiuwryCoKVEWVWzSPALzrpty1/2wYNQUFpbmNRIwZP5\n37KFrhGjw4+QZHMEc9azALzYiJaksa/hWowC4kw8h/n3QoCHwMY0BwctA4onJYPi\nWRUoeTe9D2fpNuvndTHc3pR+Fl77+9mZgsmAe27A1UfAxSWxmlMsL25gR1ueTM54\ndP/+fp+5Le5VSYYepMi/A8zn4rLho9u/VvNxcqWNsfjO0NQ3u6x9qL9W9HnC6WPN\nnFCb3sPkSTP7dpNJHwOcFGgpIvP8WuRFrRdsqosyPczSr1Q9TUVoA+fQetzh+2p0\npruHVlfGo/5atMZVKPbVQCW8FS/JDmgcVyGFz/rZ0QKBgQDXmxEdso7pJkBEmEWO\nZ3AYm2QrvmoSKzaa3XZmexJNsNxstJieRssSbujBXSkV8rR2sGiEk5U+VJSkjfLm\nLsqY6AEzO52y73nN5Uhx1W2JkbaQyLGqrGF1YkBT89152jpkdsYm4kH6opojNjXu\nmg3bl1932JOSbhKweRAz7WVdaQKBgQDULLTnlppirYE69tfyQkQ+X6Ozuz6PlWQS\nRZ/jvDyUXoiNEjyx+FsxHlq1kWXf/ZeIVbkHdfkksuqxiJ/lfu/sPwoQW8VqDl5C\nSqOJoztgFtkzuZQWghSAKATxFxIyTiW/ff4yuzRKqNzox9+k9i8lcXwd9G8Av+Pk\noudb/FysgwKBgGhIzb+ShUNKSB2llUcqyvJr/siVwlJlanT/l2w8LP89A3Dk7Ujp\nLwIMeTJF8EB4c0dRTkyJ4c8TNA5fxlQF3+KTnTj9pepNoJmxRBgjRmca/rYLDLxj\nwoP3cOvqcX6lykabmH5oQ8eJ7IoJh46QHxHOptOeAsr5yLpo5Chps/S5AoGAJQ2N\npif53CO6vsZe3fLOoinnl7qqaT7IlBxOmOHFno+Hv0MhEF9z5XcMlkrHBL/vl6KI\nxpHGqa8JJ2nZqqVpVtOHeWXdavEJawBH4QB9nQFAezT8dJXQ6LSUcFn8FobpNrDV\nFJz2u9cThR9qog9QGnTgHQcT34ijTslYKAtBT+sCgYEAkLMsNxCMsO3jL02PzjWP\niVDjWZ2ru7uiH9W9KjFuMQg1k0lOzUs5tw9iTYUcQuVJsJ0MWCxgHjkerN6+Ncy3\nuP5MXSzcmmjo6K5lgmcAVzpdqe16rzFKvMkQV89Qpaf87GK/+k6aZEpQ2srkdhkV\ns3nPAvs0hOe3QJCD1o9/qq0=\n-----END PRIVATE KEY-----\n',
  client_email:
    'firebase-adminsdk-n3v9l@all-backend-fd5c7.iam.gserviceaccount.com',
  client_id: '107054637939565406677',
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url:
    'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-n3v9l%40all-backend-fd5c7.iam.gserviceaccount.com',
  universe_domain: 'googleapis.com',
};

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const errorMessage = (err, statusCode, res, next) => {
  if (process.env.DEV_ENV === 'Development') {
    const response = {
      status: err.status || 'fail',
      message: err.message,
      err,
      errStack: err.stack,
    };
    res.status(statusCode).json(response);
  } else {
    return next(new AppError(err.message, statusCode));
  }
};
const sendPushNotification = async (token, body, title, image) => {
  const message = {
    token,
    notification: {
      title,
      body,
    },
    android: {
      notification: {
        imageUrl: image,
      },
    },
    apns: {
      payload: {
        aps: {
          'mutable-content': 1,
        },
      },
      fcm_options: {
        image,
      },
    },
    webpush: {
      headers: {
        image,
      },
    },
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('Successfully sent message:', response);
  } catch (error) {
    console.error('Error sending message:', error);
  }
};
const sendPushNotification1 = async (req, res, next) => {
  const { title, body, image } = req.body;
  const token = req.user.FCM;
  const message = {
    token,
    notification: {
      title,
      body,
    },
    android: {
      notification: {
        imageUrl: image,
      },
    },
    apns: {
      payload: {
        aps: {
          'mutable-content': 1,
        },
      },
      fcm_options: {
        image,
      },
    },
    webpush: {
      headers: {
        image,
      },
    },
  };

  try {
    await admin.messaging().send(message);
    const response = {
      status: 'success',
      message: 'notification send successfully',
    };
    res.status(200).json(response);
  } catch (error) {
    errorMessage(error, 400, res, next);
  }
};
const sendingNotificationTomultipleDevice = async (
  token,
  body,
  title,
  image
) => {
  const message = {
    tokens: token,
    notification: {
      title,
      body,
    },
    android: {
      notification: {
        imageUrl: image,
      },
    },
    apns: {
      payload: {
        aps: {
          'mutable-content': 1,
        },
      },
      fcm_options: {
        image,
      },
    },
    webpush: {
      headers: {
        image,
      },
    },
  };
  admin
    .messaging()
    .sendMulticast(message)
    .then((response) => {})
    .catch((error) => {
      console.error('Error sending multicast notification:', error);
    });
};
module.exports = {
  sendPushNotification,
  sendPushNotification1,
  sendingNotificationTomultipleDevice,
};
