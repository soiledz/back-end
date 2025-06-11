import express, {Response} from 'express'
import {RequestWithBody, RequestWithParams, RequestWithParamsAndBody, RequestWithQuery} from "./types";
import {CreateCourseModel} from "./models/CreateCourseModel";
import {UpdateCourseModel} from "./models/UpdateCourseModel";
import {QueryCourseModel} from "./models/QueryCourseModel";
import {CourseViewModel} from "./models/CourseViewModel";
import {URLParamsCourseIdModel} from "./models/URLParamsCourseIdModel";

export const app = express()
const port = 3000

export const HTTP_STATUSES = {
    OK_200: 200,
    CREATED_201: 201,
    NO_CONTENT_204: 204,

    BAD_REQUEST_400: 400,
    NOT_FOUND_404: 404,
}

const jsonBodyMiddleware = express.json()
app.use(jsonBodyMiddleware)

type CourseType = {
    id: number,
    title: string
}

const db: { courses: CourseType[] } = {
    courses: [
        {id: 1, title: 'front-end'},
        {id: 2, title: 'back-end'},
        {id: 3, title: 'automation qa'},
        {id: 4, title: 'devops'},
    ],
}

const getCourseViewModel = (dbCourse: CourseType): CourseViewModel => {
    return{
        id: dbCourse.id,
        title: dbCourse.title
    }
}

app.get('/courses', (req: RequestWithQuery<QueryCourseModel>,
                     res: Response<CourseViewModel[]>) => {
    let foundCourses = db.courses
    if (req.query.title) {
        foundCourses = foundCourses
            .filter(course => course.title.indexOf(req.query.title as string) > -1)
    }

    res.json(foundCourses.map(getCourseViewModel))
})

app.get('/courses/:id', (req: RequestWithParams<URLParamsCourseIdModel>,
                         res: Response<CourseViewModel>) => {
    const foundCourse = db.courses.find(course => course.id === +req.params.id);
    if (!foundCourse) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        return
    }

    res.json(getCourseViewModel(foundCourse))
})

app.post('/courses', (req: RequestWithBody<CreateCourseModel>,
                      res: Response<CourseViewModel>) => {
    if (!req.body.title) {
        res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400)
        return
    }
    const createCourse = {
        id: +(new Date()),
        title: req.body.title,
    };
    db.courses.push(createCourse)
    res
        .status(HTTP_STATUSES.CREATED_201)
        .json(getCourseViewModel(createCourse))
})

app.delete('/courses/:id', (req: RequestWithParams<URLParamsCourseIdModel>, res) => {
    db.courses = db.courses.filter(course => course.id !== +req.params.id);

    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
})

app.put('/courses/:id', (req: RequestWithParamsAndBody<URLParamsCourseIdModel, UpdateCourseModel>,
                         res) => {
    if (!req.body.title) {
        res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400)
        return
    }
    const foundCourse = db.courses.find(course => course.id === +req.params.id);
    if (!foundCourse) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        return
    }

    foundCourse.title = req.body.title;

    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
})

app.delete('/__test__/data', (req, res) => {
    db.courses = []
    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})