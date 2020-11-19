package com.google.sps.servlets;

import com.google.appengine.api.blobstore.BlobKey;
import com.google.appengine.api.blobstore.BlobstoreService;
import com.google.appengine.tools.development.testing.LocalBlobstoreServiceTestConfig;
import com.google.appengine.tools.development.testing.LocalDatastoreServiceTestConfig;
import com.google.appengine.tools.development.testing.LocalServiceTestHelper;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import org.mockito.Mockito;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@RunWith(JUnit4.class)
public final class BlobServletTest {

    private static final LocalServiceTestHelper helper =
            new LocalServiceTestHelper(
                    new LocalDatastoreServiceTestConfig(),
                    new LocalBlobstoreServiceTestConfig());

    private static HttpServletRequest request;
    private static HttpServletResponse response;
    private static StringWriter stringWriter;
    private static PrintWriter writer;
    private static BlobstoreService spiedBlobService;

    private static final int KEY_TO_BLOB_CODE = BlobAction.KEY_TO_BLOB.ordinal();
    private static final int GET_URL_CODE = BlobAction.GET_URL.ordinal();
    private static final String BLOB_KEY_STRING = "keyString";
    private static final BlobKey BLOB_KEY = new BlobKey(BLOB_KEY_STRING);
    private static final String NO_KEY_RESPONSE = "{\"blobKey\":\"\"}\n";
    private static final String UPLOAD_URL = "/blob-service";

    @Before
    public void setUp() throws IOException {
        helper.setUp();

        request = mock(HttpServletRequest.class);
        response = mock(HttpServletResponse.class);
        stringWriter = new StringWriter();
        writer = new PrintWriter(stringWriter);
        when(response.getWriter()).thenReturn(writer);

        spiedBlobService = spy(BlobstoreService.class);
    }

    @After
    public void tearDown() {
        helper.tearDown();
    }

    @Test
    // Test the KEY_TO_BLOB case when the given key string is empty
    public void doGetNoBlob() throws IOException {

        when(request.getParameter("blobAction")).thenReturn(Integer.toString(KEY_TO_BLOB_CODE));
        when(request.getParameter("blob-key")).thenReturn("");

        new BlobServlet().doGet(request, response, spiedBlobService);

        verify(spiedBlobService).serve(new BlobKey(""), response);
    }

    @Test
    // Test the KEY_TO_BLOB case when the given key string is not empty
    public void doGetBlob() throws IOException {

        when(request.getParameter("blobAction")).thenReturn(Integer.toString(KEY_TO_BLOB_CODE));
        when(request.getParameter("blob-key")).thenReturn(BLOB_KEY_STRING);

        new BlobServlet().doGet(request, response, spiedBlobService);

        verify(spiedBlobService).serve(BLOB_KEY, response);
    }

    @Test
    // Test the GET_URL case
    public void doGetUrl() throws IOException {

        when(request.getParameter("blobAction")).thenReturn(Integer.toString(GET_URL_CODE));

        new BlobServlet().doGet(request, response, spiedBlobService);

        verify(spiedBlobService).createUploadUrl(UPLOAD_URL);
    }


    @Test
    // Post a request containing blobs
    public void doPostWithBlob() throws IOException {

        Map<String, List<BlobKey>> fakeKeyMap = new HashMap<>();
        fakeKeyMap.put("image", Arrays.asList(BLOB_KEY));

        when(spiedBlobService.getUploads(Mockito.any(HttpServletRequest.class))).thenReturn(fakeKeyMap);

        new BlobServlet().doPost(request, response, spiedBlobService);

        assertTrue(stringWriter.toString().contains(BLOB_KEY_STRING));
    }

    @Test
    // Post a request containing a blob that wasn't defined as 'image'
    public void doPostNoImage() throws IOException {

        Map<String, List<BlobKey>> fakeKeyMap = new HashMap<>();
        BlobKey blobKey = new BlobKey(BLOB_KEY_STRING);
        fakeKeyMap.put("file", Arrays.asList(blobKey));
        when(spiedBlobService.getUploads(Mockito.any(HttpServletRequest.class))).thenReturn(fakeKeyMap);

        new BlobServlet().doPost(request, response, spiedBlobService);

        assertTrue(stringWriter.toString().equals(NO_KEY_RESPONSE));
    }

    @Test
    // Post a request not containing any blobs
    public void doPostNoBlob() throws IOException {

        Map<String, List<BlobKey>> emptyKeyMap = new HashMap<>();
        when(spiedBlobService.getUploads(Mockito.any(HttpServletRequest.class))).thenReturn(emptyKeyMap);

        new BlobServlet().doPost(request, response, spiedBlobService);

        assertTrue(stringWriter.toString().equals(NO_KEY_RESPONSE));
    }
}