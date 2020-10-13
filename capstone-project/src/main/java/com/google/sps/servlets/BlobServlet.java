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
import com.google.gson.Gson;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.rmi.server.ExportException;
import java.util.HashMap;
import java.util.Map;

// Enum describing which action should be performed.
enum BlobAction {
    GET_KEY,
    GET_URL
}

/** Handles serving blobs directly from blobstore. */
@WebServlet("/blob-service")
public class BlobServlet extends HttpServlet {

    @Override
    public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        BlobstoreService blobstoreService = BlobstoreServiceFactory.getBlobstoreService();
        Gson gson = new Gson();
        int actionNum = Integer.parseInt(request.getParameter("blobAction"));
        BlobAction action = BlobAction.values()[actionNum];
        switch (action) {
            case GET_KEY:
                BlobKey blobKey = new BlobKey(request.getParameter("blob-key"));
                blobstoreService.serve(blobKey, response);
                break;
            case GET_URL:
                String uploadUrl = blobstoreService.createUploadUrl("/markers");
                System.out.println("@@@@@@@@@" + uploadUrl);
                Map<String,String> responseMap = new HashMap<>();
                responseMap.put("imageUrl", uploadUrl);
                String responseJson = gson.toJson(responseMap);
                System.out.println(responseJson);
                response.setContentType("application/json");
                response.getWriter().println(responseJson);
        }
    }
}