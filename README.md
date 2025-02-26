## Technical overview

### Express

### BullMQ/Redis

### MinIO

MinIO is an S3-compatible object storage system. It performs better then a
relational database for storing images, and it illustrates how this API might
work if it used S3 as storage (which I would do if this was a commercial
project).

### Postgres

This API has just two tables: `job` and `image`. They have a one-to-one
relationship. `job` carries information pertaining to the status of an image,
whereas `image` carries information pertaining to storage and retrieval of the
image itself.

All of this information could go in `job`, but that table could become bloated
as the project matures, and it is reasonable to expect that other resources
might want to access the image independently of the `job`.

### Prisma

Prisma is a TypeScript-compatible ORM which works well with Postgres. Given the
simplicity of the database and the need to work in TypeScript, it was a logical
choice.

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

## Domains

### Job

A `job` is a request to process an image, namely to create a thumbnail from an
original. Its status indicates if processed images have been created and are
available. Status proceeds as such:

1. `UNPROCESSED`: the initial status, before any processing is requested
2. `PROCESSING`: processing has been requested, but no results are in
3. `PROCESSED`: *all* requested versions of the image were processed
4. `FAILED`: *any* requested version of the image was not processed

### Image

An `image` is the image entity associated with a `job`. It contains the blob ID
and also indicates how the image was processed.

There are two versions of an `image`: original and thumbnail. More might be
added later, but those are not being considered yet.

When an `image` is "processed", it means that the it was resized (thumbnail
only) and uploaded to storage. A valid blob ID is indicative of successful
processing. The associated job is `PROCESSED` only once both/all images have
blob IDs.

## Endpoints

Not covering all endpoints here, just some decisions around a few key endpoints.

### `POST /jobs`

This endpoint accepts an image to be resized and `sizes`, which is an enum of
image sizes to process. At the moment, the only option is `thumbnail`. However,
the specs indicate "more time-consuming image processing" will be needed, so it
is best to plan for the eventuality of other image sizes.

The original image is always stored when this endpoint is called. It does not
sense to re-upload that version of the image whenever the user wants to do
something with it.

### `GET /jobs`

By default, this will return the most recent 100 jobs. The reason is to prevent
overfetching of data, as the UI can only display so much information. Results
are in reverse `createdAt`, as it is assumed that the most recent jobs are the
most relevant.

### `PATCH /jobs/{jobId}/retry`

For future reference. This endpoint was not implemented, but it would be a very
good idea to retry failed jobs. (Another reason to always store the original
image).

## Notes, TODOs

- `image` entries cannot be deleted until their blobs are delete from storage
- `console.error` is being used where a proper error logger should be used
- Check that errors from dependencies are being caught, handled
