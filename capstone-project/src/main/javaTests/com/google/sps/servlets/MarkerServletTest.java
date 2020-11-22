package com.google.sps.servlets;

import com.google.appengine.api.datastore.Entity;
import com.google.appengine.tools.development.testing.LocalDatastoreServiceTestConfig;
import com.google.appengine.tools.development.testing.LocalServiceTestHelper;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import com.google.sps.data.Marker;
import com.google.gson.Gson;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Collection;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@RunWith(JUnit4.class)
public final class MarkerServletTest {

    private static HttpServletRequest request;
    private static HttpServletResponse response;
    private static StringWriter stringWriter;
    private static PrintWriter writer;
    private static String invalidToken;
    private static String validToken;
    private static String tokenUndefined;
    private static Marker marker;
    // This local service is needed in order to use Datastore entities in the tests.
    private static final LocalServiceTestHelper helper =
            new LocalServiceTestHelper(new LocalDatastoreServiceTestConfig());

    @Before
    public void setUp() {
        helper.setUp();
        invalidToken = "";
        tokenUndefined = "undefined";
        request = mock(HttpServletRequest.class);
        response = mock(HttpServletResponse.class);
        stringWriter = new StringWriter();
        writer = new PrintWriter(stringWriter);
        when(response.getWriter()).thenReturn(writer);
        marker = new Marker.Builder()
                .setId(1111)
                .setLat(1)
                .setLng(1)
                .setAnimal("animal")
                .setReporter("reporter")
                .setDescription("description")
                .setUserId(Optional.empty())
                .setBlobKey("blobKey")
                .build();
    }

    @After
    public void tearDown() {
        helper.tearDown();
    }

    @Test
    // Test CREATE case when user undefined
    public void doGetCreateNoUser() throws IOException {
        Gson gson = new Gson();
        String markerJson = gson.toJson(marker);
        when(request.getParameter("blobAction")).thenReturn(Integer.toString(KEY_TO_BLOB_CODE));
        when(request.getParameter("blob-key")).thenReturn("");

        new BlobServlet().doGet(request, response, spiedBlobService);

        verify(spiedBlobService).serve(new BlobKey(""), response);
    }
}