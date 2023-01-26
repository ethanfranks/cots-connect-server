import { Request, Response } from 'express';
import { dataSource } from '../sql-data-source';
import { Users } from '../entities/users.entity';
import bcryptjs from 'bcryptjs';
import { sign, verify } from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const Register = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await dataSource.getRepository(Users).save({
      email,
      password_hash: await bcryptjs.hash(password, 12),
    });

    res.send(user);
  } catch (e) {
    console.log(e);
  }
};

export const Login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await dataSource.getRepository(Users).findOne({
      where: {
        email: email,
      },
    });

    if (!user) {
      return res.status(400).send({
        message: 'invalid credentials',
      });
    }

    if (!(await bcryptjs.compare(password, user.password_hash))) {
      return res.status(400).send({
        message: 'invalid credentials',
      });
    }

    const accessToken = sign(
      {
        id: user.id,
      },
      process.env.ACCESS_SECRET!,
      { expiresIn: 60 * 60 }
    );

    const refreshToken = sign(
      {
        id: user.id,
      },
      process.env.REFRESH_SECRET!,
      { expiresIn: 24 * 60 * 60 }
    );

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.send({
      message: 'success',
    });
  } catch (e) {
    console.log(e);
  }
};

export const AuthenticatedUser = async (req: Request, res: Response) => {
  try {
    console.log(req.cookies);
    const accessToken = req.cookies['accessToken'];

    const payload: any = verify(accessToken, process.env.ACCESS_SECRET!);

    if (!payload) {
      return res.status(401).send({
        message: 'unauthenticated',
      });
    }

    const user = await dataSource.getRepository(Users).findOne({
      where: {
        id: payload.id,
      },
    });

    if (!user) {
      return res.status(401).send({
        message: 'unauthenticated',
      });
    }

    const { password_hash, ...data } = user;

    res.send(data);
  } catch (e) {
    console.log(e);
    return res.status(401).send({
      message: 'unauthenticated',
    });
  }
};

export const Refresh = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies['refreshToken'];

    const payload: any = verify(refreshToken, process.env.REFRESH_SECRET!);

    if (!payload) {
      return res.status(401).send({
        message: 'unauthenticated',
      });
    }

    const accessToken = sign(
      {
        id: payload.id,
      },
      process.env.ACCESS_SECRET!,
      { expiresIn: 60 * 60 }
    );

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.send({
      message: 'success',
    });
  } catch (e) {
    console.log(e);
    return res.status(401).send({
      message: 'unauthenticated',
    });
  }
};

export const Logout = async (req: Request, res: Response) => {
  res.cookie('accessToken', '', { maxAge: 0 });
  res.cookie('refreshToken', '', { maxAge: 0 });
};
