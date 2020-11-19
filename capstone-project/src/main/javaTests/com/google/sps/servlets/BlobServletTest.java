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
import static org.mockito.Mockito.*;

@RunWith(JUnit4.class)
public final class BlobServletTest {

    private static final LocalServiceTestHelper helper =
            new LocalServiceTestHelper(
                    new LocalDatastoreServiceTestConfig(),
                    new LocalBlobstoreServiceTestConfig());
    private static final String KEY_STRING = "keyString";
    private static final String EMPTY_RESPONSE = "{\"blobKey\":\"\"}\n";

    @Before
    public void setUp() {
        helper.setUp();
    }

    @After
    public void tearDown() {
        //helper.tearDown();
    }

    /*@Test
    public void doGetBlob() throws IOException {
        BlobKey mockKey = mock(BlobKey.class);
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getParameter("blobAction")).thenReturn(BlobAction.valueOf("KEY_TO_BLOB").toString());
        when(request.getParameter("blob-key")).thenReturn(mockKey);
        HttpServletResponse response = mock(HttpServletResponse.class);
        BlobstoreService mockBlobService = mock(BlobstoreService.class);

        when(mockBlobService.serve())


        BlobServlet spiedServlet = spy(BlobServlet.class);
        when(spiedServlet.getBlobService()).thenReturn(mockBlobService);
    }*/


    @Test
    // Post a request containing blobs
    public void doPostWithBlob() throws IOException {

        final HttpServletRequest request = mock(HttpServletRequest.class);
        final HttpServletResponse response = mock(HttpServletResponse.class);

        StringWriter stringWriter = new StringWriter();
        PrintWriter writer = new PrintWriter(stringWriter);
        when(response.getWriter()).thenReturn(writer);


        BlobKey blobKey = new BlobKey(KEY_STRING);
        Map<String, List<BlobKey>> fakeKeyMap = new HashMap<>();
        fakeKeyMap.put("image", Arrays.asList(blobKey));

        BlobstoreService spiedBlobService = spy(BlobstoreService.class);

        when(spiedBlobService.getUploads(Mockito.any(HttpServletRequest.class))).thenReturn(fakeKeyMap);

        new BlobServlet().doPost(request, response, spiedBlobService);

        assertTrue(stringWriter.toString().contains(KEY_STRING));
    }

    @Test
    // Post a request containing a blob that wasn't defined as 'image'
    public void doPostNullBlob() throws IOException {

        final HttpServletRequest request = mock(HttpServletRequest.class);
        final HttpServletResponse response = mock(HttpServletResponse.class);

        StringWriter stringWriter = new StringWriter();
        PrintWriter writer = new PrintWriter(stringWriter);
        when(response.getWriter()).thenReturn(writer);

        BlobstoreService spiedBlobService = spy(BlobstoreService.class);
        Map<String, List<BlobKey>> fakeKeyMap = new HashMap<>();
        BlobKey blobKey = new BlobKey(KEY_STRING);
        fakeKeyMap.put("file", Arrays.asList(blobKey));
        when(spiedBlobService.getUploads(Mockito.any(HttpServletRequest.class))).thenReturn(fakeKeyMap);

        new BlobServlet().doPost(request, response, spiedBlobService);

        assertTrue(stringWriter.toString().equals(EMPTY_RESPONSE));
    }

    @Test
    // Post a request not containing any blobs
    public void doPostNoBlob() throws IOException {

        final HttpServletRequest request = mock(HttpServletRequest.class);
        final HttpServletResponse response = mock(HttpServletResponse.class);

        StringWriter stringWriter = new StringWriter();
        PrintWriter writer = new PrintWriter(stringWriter);
        when(response.getWriter()).thenReturn(writer);

        BlobstoreService spiedBlobService = spy(BlobstoreService.class);
        Map<String, List<BlobKey>> emptyKeyMap = new HashMap<>();
        when(spiedBlobService.getUploads(Mockito.any(HttpServletRequest.class))).thenReturn(emptyKeyMap);

        new BlobServlet().doPost(request, response, spiedBlobService);

        assertTrue(stringWriter.toString().equals(EMPTY_RESPONSE));
    }
}