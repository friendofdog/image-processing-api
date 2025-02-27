# Image Processing API

Author: Kevin Kee <kevinkee9@gmail.com>

## Assumptions

- The UI will send an image which the user has already trimmed to a square.
- The original image should be kept in storage, as it could be used for other
things down the road. For example, if larger image resolutions introduced, there
needs to be a way to access the original image.
- It is reasonable to expect that the API will expand past the original goal of
creating simple thumbnails. As such, endpoints, methods, etc. should be kept as
generic as possible, while still adhering to specs.

## How to run

1. Set environment variables in a `.env` file, which can be created by copying
the `.env.example` file
2. Install dependencies using `npm install`
3. Run `docker compose up -d` to create instances of Postgres, MinIO, and Redis
on your environment, including a bucket for image storage
4. Run `npm run migrate:up` to run migrations on Postgres
5. To start application...
    - Dev: `npm run dev`
    - Prod: `npm run build` to build `/dist`, then `npm run start`

API endpoints are documented using Swagger at `/api-docs`.

## Technical choices and architecture

### Express

Express is lightweight, supports middleware, works well with TypeScript, and is
not overly complex for a small project. It supports things such as request
validation, file upload, and response handling.

### BullMQ/Redis

Being asynchronous and non-blocking, a message queue is suitable for offloading
image processing tasks while allowing the request-response cycle to complete.

BullMQ, being a NodeJS library with minimal overhead, was a good choice given
the scope and intention of this project. It does not natively support sub/pub,
meaning that the client has to poll the image results; but this was accounted
for in the specs. It uses Redis, which itself must be managed separately, but
it's an acceptable tradeoff for ensuring job persistence and high throughput.

### MinIO

A relational database is not the best choice for image storage, as that can
increase the database size and cause performance issues. Therefore, an object
storage database is more suitable.

The original plan was to use S3. However, that would have made this project
dependent on AWS, which is a bit too much given the scope. Therefore, MinIO was
selected, as it is an S3-compatible object storage system which run locally,
satisfies image storage requirements, and can (theoretically) be swapped out for
S3.

### Postgres

A central premise of this API is that there is a `job` and an `image`, and that
the two are related to each other. Data could be stored in a NoSQL database, but
structured, relational storage lends itself better to this situation.

Postgres can appropriately handle this, while being flexible enough for future
changes. There is no reason to expect more specialised storage to be needed, and
it is not overly complex for the first iteration.

### Prisma

The choice to use Prisma was determined largely by the rest of the technical
choices, namely TypeScript and Postgres.

Prisma generates interfaces from SQL schema, which is useful in ensuring type
consistency across the entire API. Database operations are abstracted to a level
which is appropriate, given the simplicity of the relationship between `job` and
`image`.

## Domains

### Job

A `job` is a request to process an image, namely to create a thumbnail from an
original. Its status indicates if processed images have been created and are
available. Statuses are:

1. `UNPROCESSED`: the initial status, before any processing is requested
2. `PROCESSING`: processing has been requested, but no results are in
3. `PROCESSED`: *all* requested versions of the image were processed
4. `FAILED`: *any* requested version of the image was not processed

### Image

An `image` has a one-to-one relationship with a `job` and stores data which is
pertinent to the image file (namely blob IDs). This data could have been kept in
the `job`, but it is reasonable to expect that someone would need to access it
independently of the `job`.

There are two versions of an image: `original` and `thumbnail`. More might be
added later, but those are not part of current iteration.

## Putting into production

Authorization is a must. The data in this project isn't the most confidential,
but it could be very expensive if anyone can upload images without restriction.

Authentication and an association between job and user is needed. This helps
restrict unwanted access to resources, and eventually you will want to know who
created which images.

The way Docker is set up works locally, but is perhaps not appropriate for prod,
on account that it runs databases on the same machine as the API. This might not
be ideal, for example, if Postgres is running on some hosted service.

Integration tests would be useful in determining if messages are correctly sent,
received, and processed.

## Scaling

Redis could be a bottleneck under heavy loads. One solution could be to scale
horizontally, but that needs to be managed and adds overhead. Another solution
could be to move messaging to AWS, using *API Gateway*, *S3*, and *Lambda* to
manage image processing and storage. This would ensure that resource are
requisitioned only when needed.

One of the feature of this API is listing jobs to see which ones have completed
images. This does not work if there are hundreds of recent jobs. The logic
behind this search will have to be amended, perhaps listing jobs by user or by
a given time range.

On the same note the Postgres database will eventually grow quite large. It
would help to add indexing. Depending on how often people access images versus
creating them, read-only copies of the database might also be useful.

## Ideas for future iterations

- Access images directly. It's very likely that someone will want to retrieve a
thumbnail without referencing the job.
- Add a retry endpoint for jobs that get stuck in `PROCESSING` (for example).
- Delete jobs and images. Because images take up a lot of space, there should be
a way to remove them. Need to be careful not to orphan images in storage when a
`image` entry is deleted.
- Implement error logging. As of now, `console.error` and `console.log` are used
roughly where a proper logger could be used to keep track of important events.
- Add some extra options for image sizing for images that are not already a
perfect square.
- Environment variables are a bit messy, could use some cleaning up.
