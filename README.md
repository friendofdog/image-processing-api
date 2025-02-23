## Domains

### Job

A `job` is a request to process an image, namely to create a thumbnail from an
original. Its status indicates if processed images have been created and are
available. Status proceeds as such:

1. `UNPROCESSED`: the initial status, before any processing is requested
2. `PROCESSING`: processing has been requested, but no results are in
3. `PROCESSED`: *all* versions of the image were processed
4. `FAILED`: *any* version of the image was not processed

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

### `GET /jobs`

By default, this will return the most recent 100 jobs. The reason is to prevent
overfetching of data, as the UI can only display so much information. Results
are in reverse `createdAt`, as it is assumed that the most recent jobs are the
most relevant.

## Notes, TODOs

- `prisma generate` needs to be worked into build and Docker
- `image` entries cannot be deleted until their blobs are delete from storage
- Calls to AWS S3 log error in console and throw a non-specific message to
abstract the error (which we do not necessarily want returning to client)
