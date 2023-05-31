package com.hfi.app.servlet;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;

/**
 * Created by Administrator on 2017/10/9.
 */
@WebServlet(name = "busStationInfoServlet", urlPatterns = {"/busStationInfo"})
public class BusStationInfoServlet extends HttpServlet{
    private static Logger LOGGER = LoggerFactory.getLogger(BusStationInfoServlet.class);
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setHeader("Access-Control-Allow-Origin", "*");
        LOGGER.debug("busStationInfo=====");
        String SL_id = req.getParameter("SL_id");
        int distance01 = (int) (Math.random()*50) + 500;
        double distance02 = (int) (Math.random()*10);
        String strDis01 = String.valueOf(distance01) + "米";
        String strDis02 = String.valueOf(distance02) + "公里";
        String str = "{\"station\":[{\"id\":1,\"nextstop\":\"龙井路\",\"stopcount\":\"2\",\"time\":\"3分钟\"," +
                "\"distance\":\" " + strDis01 + "\"},{\"id\":2,\"nextstop\":\"浙江大学\",\"stopcount\":\"5\"," +
                "\"time\":\"15分钟\"," +
                "\"distance\":\" " + strDis02 + "\"}],\"status\":1}";
        resp.setContentType("application/json; charset=utf-8");
        PrintWriter writer = resp.getWriter();
        writer.write(str);
        writer.flush();
    }
}
