// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package com.google.sps.servlets;

import com.google.appengine.api.blobstore.BlobKey;
import com.google.appengine.api.blobstore.BlobstoreService;
import com.google.appengine.api.blobstore.BlobstoreServiceFactory;
import com.google.gson.JsonObject;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import java.util.Map;

// Enum describing which action should be performed.
enum BlobAction {
    KEY_TO_BLOB,
    GET_URL,
}

/** Handles file uploads and performs blob-related actions. */
@WebServlet("/blob-service")
public class BlobServlet extends HttpServlet {

    /** Responds with either the blob of a given blob key or the URL to post blobs to. */
    @Override
    public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {

        BlobstoreService blobstoreService = BlobstoreServiceFactory.getBlobstoreService();
        
        int actionNum = Integer.parseInt(request.getParameter("blobAction"));
        BlobAction action = BlobAction.values()[actionNum];
        switch (action) {
            // For action code KEY_TO_BLOB return the blob of the given blob key
            case KEY_TO_BLOB:
                BlobKey blobKey = new BlobKey(request.getParameter("blob-key"));
                blobstoreService.serve(blobKey, response);
                break;
            // For action code GET_URL return the URL which first sends the file to BlobStore and then redirects it for further processing.
            case GET_URL:
                String uploadUrl = blobstoreService.createUploadUrl("/blob-service");
                JsonObject jsonResponse = new JsonObject();
                jsonResponse.addProperty("imageUrl", uploadUrl);
                response.setContentType("application/json");
                response.getWriter().println(jsonResponse);
                break;
        }
    }

    /** Returns the blob key of the file that was uploaded after the BlobStore processing is finished . */
    @Override
    public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {

        BlobstoreService blobstoreService = BlobstoreServiceFactory.getBlobstoreService();
        String blobKeyAsString = getBlobKey(request, blobstoreService);
        JsonObject jsonResponse = new JsonObject();
        jsonResponse.addProperty("blobKey", blobKeyAsString);
        response.setContentType("application/json");
        response.getWriter().println(jsonResponse);
    }

    /** Returns the BlobKey of an uploaded image so we can serve the blob. */
    private static String getBlobKey(HttpServletRequest request, BlobstoreService blobstoreService) {

        // Get all files uploaded to Blobstore from this request
        Map<String, List<BlobKey>> blobs = blobstoreService.getUploads(request);
        // Get the blob key associated with the image uploaded
        List<BlobKey> blobKeys = blobs.get("image");
        String blobKey = "";
        // If a file was uploaded
        if(blobKeys != null && !blobKeys.isEmpty()) {
            blobKey = blobKeys.get(0).getKeyString();
        }

        return blobKey;
    }

    /** Imitates the real doPost method for testing purposes */
    public void doPost(HttpServletRequest request, HttpServletResponse response, BlobstoreService blobstoreService) throws IOException {
        
        String blobKeyAsString = getBlobKey(request, blobstoreService);
        JsonObject jsonResponse = new JsonObject();
        jsonResponse.addProperty("blobKey", blobKeyAsString);
        response.setContentType("application/json");
        response.getWriter().println(jsonResponse);
    }
}