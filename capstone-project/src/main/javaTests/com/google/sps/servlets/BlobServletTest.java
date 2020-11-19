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
    public void doPostWithBlob() throws IOException {

        final HttpServletRequest request = mock(HttpServletRequest.class);
        final HttpServletResponse response = mock(HttpServletResponse.class);

        StringWriter stringWriter = new StringWriter();
        PrintWriter writer = new PrintWriter(stringWriter);
        when(response.getWriter()).thenReturn(writer);


        BlobKey blobKey = new BlobKey(KEY_STRING);
        Map<String, List<BlobKey>> fakeKeys = new HashMap<>();
        fakeKeys.put("image", Arrays.asList(blobKey));

        BlobstoreService spiedBlobService = mock(BlobstoreService.class);

        when(spiedBlobService.getUploads(Mockito.any(HttpServletRequest.class))).thenReturn(fakeKeys);

        new BlobServlet().doPost(request, response, spiedBlobService);

        assertTrue(stringWriter.toString().contains(KEY_STRING));

    }
}